"""
Digital Twin Manufacturing Platform - Main FastAPI Application
"""
import asyncio
import time
from contextlib import asynccontextmanager
from datetime import datetime

import structlog
import uvicorn
from fastapi import FastAPI, WebSocket, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.core.config import settings
from app.api.sensors import router as sensors_router, set_connection_manager
from app.services.redis_service import redis_service
from app.websockets.connection_manager import ConnectionManager, heartbeat_task
from app.websockets.endpoints import handle_machine_websocket, handle_dashboard_websocket

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Global variables for services
connection_manager: ConnectionManager = None
heartbeat_task_handle: asyncio.Task = None
app_start_time: float = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown"""
    global connection_manager, heartbeat_task_handle, app_start_time
    
    # Startup
    app_start_time = time.time()
    logger.info("Starting Digital Twin Manufacturing Platform", version=settings.version)
    
    try:
        # Initialize Redis connection
        await redis_service.connect()
        logger.info("Redis service initialized")
        
        # Initialize WebSocket connection manager
        connection_manager = ConnectionManager(redis_service)
        await connection_manager.start()
        logger.info("WebSocket connection manager started")
        
        # Set connection manager for API endpoints
        set_connection_manager(connection_manager)
        
        # Start background tasks
        heartbeat_task_handle = asyncio.create_task(heartbeat_task(connection_manager))
        logger.info("Background tasks started")
        
        logger.info("Application startup completed successfully")
        
        yield
        
    except Exception as e:
        logger.error("Failed to start application", error=str(e))
        raise
    
    finally:
        # Shutdown
        logger.info("Shutting down application")
        
        # Stop background tasks
        if heartbeat_task_handle:
            heartbeat_task_handle.cancel()
            try:
                await heartbeat_task_handle
            except asyncio.CancelledError:
                pass
        
        # Stop connection manager
        if connection_manager:
            await connection_manager.stop()
        
        # Disconnect Redis
        await redis_service.disconnect()
        
        logger.info("Application shutdown completed")


# Create FastAPI application
app = FastAPI(
    title="Digital Twin Manufacturing Platform",
    description="Real-time IoT sensor data processing and monitoring platform",
    version=settings.version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Add request timing middleware
@app.middleware("http")
async def add_process_time_header(request, call_next):
    """Add processing time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time * 1000, 2))
    return response

# Include API routers
app.include_router(sensors_router)

# Root endpoint
@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with basic information"""
    uptime = time.time() - app_start_time if app_start_time else 0
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Digital Twin Manufacturing Platform</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            .header {{ color: #2c3e50; }}
            .info {{ background: #ecf0f1; padding: 20px; border-radius: 5px; }}
            .endpoint {{ margin: 10px 0; }}
            .websocket {{ color: #e74c3c; }}
            .api {{ color: #3498db; }}
        </style>
    </head>
    <body>
        <h1 class="header">🏭 Digital Twin Manufacturing Platform</h1>
        <div class="info">
            <p><strong>Version:</strong> {settings.version}</p>
            <p><strong>Status:</strong> Running</p>
            <p><strong>Uptime:</strong> {uptime:.2f} seconds</p>
            <p><strong>Environment:</strong> {'Development' if settings.debug else 'Production'}</p>
        </div>
        
        <h2>API Endpoints</h2>
        <div class="endpoint api">📊 <strong>GET /api/v1/health</strong> - Health check</div>
        <div class="endpoint api">📈 <strong>GET /api/v1/metrics</strong> - Application metrics</div>
        <div class="endpoint api">🏭 <strong>GET /api/v1/machines</strong> - Active machines</div>
        <div class="endpoint api">📡 <strong>POST /api/v1/sensors/readings</strong> - Submit sensor reading</div>
        <div class="endpoint api">📦 <strong>POST /api/v1/sensors/readings/batch</strong> - Submit batch readings</div>
        <div class="endpoint api">🔍 <strong>GET /api/v1/sensors/readings/latest/{{machine_id}}</strong> - Latest readings</div>
        
        <h2>WebSocket Endpoints</h2>
        <div class="endpoint websocket">🔌 <strong>WS /ws/machines/{{machine_id}}</strong> - Machine-specific updates</div>
        <div class="endpoint websocket">📊 <strong>WS /ws/dashboard</strong> - Dashboard real-time data</div>
        
        <h2>Documentation</h2>
        {f'<div class="endpoint"><a href="/docs">📚 Interactive API Documentation (Swagger)</a></div>' if settings.debug else ''}
        {f'<div class="endpoint"><a href="/redoc">📖 Alternative API Documentation (ReDoc)</a></div>' if settings.debug else ''}
        
        <p><em>Built with FastAPI, WebSockets, Redis, and ❤️</em></p>
    </body>
    </html>
    """
    return html_content

# WebSocket endpoints
@app.websocket("/ws/machines/{machine_id}")
async def websocket_machine_endpoint(
    websocket: WebSocket, 
    machine_id: str,
    token: str = Query(None)
):
    """WebSocket endpoint for machine-specific real-time updates"""
    await handle_machine_websocket(
        websocket, 
        machine_id, 
        connection_manager,
        redis_service,
        token
    )

@app.websocket("/ws/dashboard")
async def websocket_dashboard_endpoint(
    websocket: WebSocket,
    token: str = Query(None)
):
    """WebSocket endpoint for dashboard real-time updates"""
    await handle_dashboard_websocket(
        websocket,
        connection_manager,
        redis_service,
        token
    )

# Additional utility endpoints
@app.get("/info")
async def app_info():
    """Get application information"""
    uptime = time.time() - app_start_time if app_start_time else 0
    
    return {
        "name": settings.app_name,
        "version": settings.version,
        "status": "running",
        "uptime_seconds": round(uptime, 2),
        "debug": settings.debug,
        "redis_url": settings.redis_url.split('@')[-1] if '@' in settings.redis_url else settings.redis_url,
        "allowed_origins": settings.allowed_origins,
        "websocket_connections": len(connection_manager.active_connections) if connection_manager else 0
    }

@app.get("/status")
async def status_check():
    """Simple status check for load balancers"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
        access_log=True
    )
