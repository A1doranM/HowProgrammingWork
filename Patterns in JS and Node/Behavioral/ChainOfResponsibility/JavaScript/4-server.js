'use strict';

/**
 * FILE PURPOSE: Real-World Chain of Responsibility - HTTP Middleware
 *
 * This file demonstrates Chain of Responsibility pattern in its most
 * common real-world application: HTTP middleware (like Express.js).
 *
 * REAL-WORLD APPLICATIONS:
 * - Express.js middleware
 * - Koa.js middleware
 * - Redux middleware
 * - Logging pipelines
 * - Request/response transformations
 *
 * KEY CONCEPTS DEMONSTRATED:
 * 1. Async handler chains
 * 2. Route-based handler selection
 * 3. Multiple handlers per route
 * 4. Tree-structured routing
 *
 * PATTERN VARIANT: Middleware Pattern
 * Unlike previous examples where ONE handler processes the request,
 * middleware allows ALL handlers to process (logging, auth, etc.)
 * before final response.
 *
 * COMPARISON TO PREVIOUS FILES:
 * 1-theory.js:  First handler that CAN handle, DOES handle (stops)
 * 2-simple.js:  Same, but with functions
 * 3-adder.js:   Type-based selection, ONE processes
 * 4-server.js:  ALL handlers execute (middleware chain)
 */

const http = require('node:http');

/**
 * Symbol for storing handler arrays in routing tree
 *
 * WHY Symbol?
 * - Unique property key that won't conflict with route names
 * - Can't be accidentally overwritten or enumerated
 * - Perfect for internal metadata
 *
 * ROUTING STRUCTURE:
 * {
 *   'api': {
 *     [handlers]: [handler1, handler2],
 *     'v1': {
 *       [handlers]: [handler3],
 *       'method': {
 *         [handlers]: [handler4, handler5]
 *       }
 *     }
 *   }
 * }
 *
 * This represents:
 * /api         → [handler1, handler2]
 * /api/v1      → [handler3]
 * /api/v1/method → [handler4, handler5]
 */
const handlers = Symbol('handlers');

/**
 * HTTP Server with Middleware Chain
 *
 * Implements Express.js-style middleware system using Chain of Responsibility.
 *
 * ARCHITECTURE:
 *   Request → Routing Tree → Handler Chain → Response
 *             /api/v1/method
 *             ├─ /api handlers (auth)
 *             ├─ /api/v1 handlers (versioning)
 *             └─ /api/v1/method handlers (business logic)
 *
 * MIDDLEWARE CHARACTERISTICS:
 * 1. Multiple handlers can process same request
 * 2. Handlers execute in order
 * 3. Each handler can modify req/res
 * 4. Handler can stop chain (by not calling next or ending response)
 *
 * This is different from classic Chain of Responsibility where
 * one handler processes and stops the chain.
 */
class Server {
  /**
   * Initialize HTTP server with routing tree
   *
   * @param {number} port - Port to listen on
   *
   * INITIALIZATION:
   * 1. Create Node.js HTTP server
   * 2. Initialize routing tree
   * 3. Start listening on port
   */
  constructor(port) {
    this.port = port;
    
    // Create HTTP server with request handler
    this.http = http.createServer((req, res) => {
      this.request(req, res);  // Delegate to our routing logic
    });
    
    /**
     * Routing tree structure
     *
     * TREE STRUCTURE:
     * routing = {
     *   [handlers]: [],        // Root handlers
     *   'api': {
     *     [handlers]: [],      // /api handlers
     *     'v1': {
     *       [handlers]: [],    // /api/v1 handlers
     *       'users': {
     *         [handlers]: []   // /api/v1/users handlers
     *       }
     *     }
     *   }
     * }
     *
     * BENEFITS:
     * - Hierarchical handler organization
     * - Parent handlers execute before child handlers
     * - Efficient lookup via object properties
     */
    this.routing = { [handlers]: [] };
    
    // Start listening
    this.http.listen(port);
  }

  /**
   * Register a handler for a specific path
   *
   * @param {string} path - Route path (/api/v1/method)
   * @param {Function} handler - Async handler function
   *
   * PATH PARSING:
   * '/api/v1/method' → ['', 'api', 'v1', 'method']
   *
   * TREE BUILDING:
   * For path '/api/v1':
   * 1. Split into ['', 'api', 'v1']
   * 2. Navigate: root → api → v1
   * 3. Create nodes if they don't exist
   * 4. Add handler to v1's handlers array
   *
   * MULTIPLE HANDLERS:
   * Can call handler() multiple times for same path:
   *   server.handler('/api', logger);
   *   server.handler('/api', auth);
   *   server.handler('/api', businessLogic);
   *
   * All three will execute in order for /api requests.
   *
   * NOTE: There's a bug in the original code (see below)
   */
  async handler(path, handler) {
    const dirs = path.split('/');  // Split path into segments
    const current = this.routing;  // Start at root
    let next;
    
    /**
     * BUG IN ORIGINAL CODE:
     * This loop creates the tree but doesn't properly navigate it.
     * The 'next' variable is set but 'current' never advances.
     *
     * INTENDED LOGIC (corrected):
     * for (const dir of dirs) {
     *   if (!dir) continue; // Skip empty strings
     *   next = current[dir];
     *   if (!next) {
     *     current[dir] = { [handlers]: [] };
     *     next = current[dir];
     *   }
     *   current = next; // MISSING: Advance current pointer
     * }
     * current[handlers].push(handler); // Add handler to final node
     */
    for (const dir of dirs) {
      next = current[dir];
      if (!next) {
        current[dir] = { [handlers]: [handler] };
      }
      // BUG: Should advance 'current' here
      // BUG: Should push handler after loop, not during creation
    }
  }

  /**
   * Handle incoming HTTP request
   *
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   *
   * REQUEST FLOW:
   * 1. Parse URL into path segments
   * 2. Navigate routing tree along path
   * 3. Execute handler chain at each level
   * 4. Stop if route not found
   *
   * EXAMPLE:
   * Request: GET /api/v1/users
   *
   * Execution:
   * 1. Navigate to routing.api → Execute /api handlers
   * 2. Navigate to routing.api.v1 → Execute /api/v1 handlers
   * 3. Navigate to routing.api.v1.users → Execute /api/v1/users handlers
   *
   * This creates a hierarchical middleware chain!
   *
   * NOTE: Original code has bugs (see below)
   */
  async request(req, res) {
    /**
     * BUG: req.url.substring[1] should be req.url.substring(1)
     * substring is a method, not a property
     * Should use parentheses: req.url.substring(1)
     */
    const dirs = req.url.substring[1].split('/');  // BUG: Wrong syntax
    console.dir({ dirs });
    
    const current = this.routing;
    
    /**
     * Navigate routing tree and execute handler chains
     *
     * INTENDED BEHAVIOR:
     * For /api/v1/method:
     * 1. Execute routing['api'][handlers]
     * 2. Execute routing['api']['v1'][handlers]
     * 3. Execute routing['api']['v1']['method'][handlers]
     *
     * ACTUAL BEHAVIOR (with bugs):
     * May not work correctly due to:
     * - URL parsing bug (substring[1])
     * - Tree navigation issues
     */
    for (const dir of dirs) {
      const next = current[dir];
      if (!next) return;  // Route not found, stop
      
      const listeners = next[handlers];
      await this.chain(req, res, listeners);
      // BUG: Should advance 'current' to 'next' here
    }
  }

  /**
   * Execute handler chain for a route
   *
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   * @param {Array} listeners - Array of handler functions
   *
   * MIDDLEWARE EXECUTION:
   * Unlike classic Chain of Responsibility, ALL handlers execute.
   *
   * EXECUTION FLOW:
   * for handler in [logger, auth, validator, businessLogic]:
   *   await handler(req, res)
   *
   * HANDLER RESPONSIBILITIES:
   * - Logging: Log request details
   * - Authentication: Verify credentials
   * - Authorization: Check permissions
   * - Validation: Validate request data
   * - Business Logic: Process request
   * - Response: Send response
   *
   * STOPPING THE CHAIN:
   * Handler can stop chain by:
   * 1. Calling res.end() (sends response)
   * 2. Throwing error
   * 3. Not calling next() in next/error style middleware
   *
   * CURRENT IMPLEMENTATION:
   * Simple sequential execution, no explicit next() callback.
   * All handlers execute unless error is thrown or response sent.
   */
  async chain(req, res, listeners) {
    for (const listener of listeners) {
      await listener(req, res);
      
      // Could add check here:
      // if (res.headersSent) break;  // Response already sent, stop chain
    }
  }
}

// ===========================
// Usage Examples
// ===========================

/**
 * Create server on port 8000
 *
 * Server will listen for HTTP requests and route them
 * through the middleware chain based on URL path.
 */
const server = new Server(8000);

/**
 * Example 1: Multiple handlers for /api
 *
 * Both handlers will execute for any request to /api or /api/...
 * This demonstrates middleware chaining.
 */

/**
 * Handler 1: Business logic
 * Handles the actual request and sends response
 */
server.handler('/api', async (req, res) => {
  console.log('Request to /api');
  res.end('It works!');  // Sends response and ends request
});

/**
 * Handler 2: Logging
 * Logs request metadata
 *
 * NOTE: This will execute AFTER handler1 due to registration order.
 * In practice, you'd want logging BEFORE business logic.
 * Better order: register logger first, then business logic.
 */
server.handler('/api', async (req, res) => {
  console.log('Remote address: ' + res.socket.remoteAddress);
  res.end('It works!');  // Trying to send response again (error!)
});

/**
 * Example 2: Nested route /api/v1
 *
 * Request to /api/v1 would execute:
 * 1. Both /api handlers
 * 2. This /api/v1 handler
 *
 * This demonstrates hierarchical middleware.
 */
server.handler('/api/v1', async (req, res) => {
  console.log('Request to /api/v1');
  res.end('It works!');
});

/**
 * Example 3: Deep nested route /api/v1/method
 *
 * Request to /api/v1/method would execute:
 * 1. Both /api handlers
 * 2. /api/v1 handler
 * 3. Both /api/v1/method handlers
 *
 * This shows how middleware chains at multiple levels.
 */
server.handler('/api/v1/method', async (req, res) => {
  console.log('Call: /api/v1/method');
  res.end('It works!');
});

/**
 * Example 4: Another handler for same route
 *
 * Multiple handlers can be registered for the same route.
 * They execute in registration order.
 */
server.handler('/api/v1/method', async (req, res) => {
  console.log('Should not be executed');
  res.end('It works!');
  // This will fail because response already sent by previous handler
});

/**
 * PROBLEMS IN THIS IMPLEMENTATION:
 *
 * 1. Multiple res.end() calls:
 *    - Once response is sent (res.end), can't send again
 *    - Should check: if (res.headersSent) return;
 *
 * 2. Handler registration bug:
 *    - Tree navigation doesn't work correctly
 *    - Handlers might not be added to correct nodes
 *
 * 3. No error handling:
 *    - If handler throws, server crashes
 *    - Should wrap in try/catch
 *
 * 4. No next() callback:
 *    - Can't skip to next handler conditionally
 *    - Express-style next() gives more control
 */

/**
 * IMPROVED MIDDLEWARE PATTERN:
 *
 * Express.js style with next() callback:
 */
/*
class ImprovedServer {
  async chain(req, res, handlers) {
    let index = 0;
    
    const next = async (err) => {
      if (err) {
        // Error handling
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }
      
      if (index >= handlers.length) return; // End of chain
      if (res.headersSent) return;          // Response already sent
      
      const handler = handlers[index++];
      try {
        await handler(req, res, next);  // Pass next callback
      } catch (error) {
        next(error);  // Pass error to next
      }
    };
    
    await next();  // Start chain
  }
}

// Usage with explicit next():
server.use('/api', async (req, res, next) => {
  console.log('Logger');
  await next();  // Pass to next handler
});

server.use('/api', async (req, res, next) => {
  if (!req.headers.authorization) {
    res.statusCode = 401;
    res.end('Unauthorized');
    return;  // Don't call next(), stop chain
  }
  await next();  // Authorized, continue
});

server.use('/api', async (req, res) => {
  // Business logic
  res.end('Success');
  // No next() call, this is the final handler
});
*/

/**
 * REAL-WORLD MIDDLEWARE CHAIN EXAMPLE:
 *
 * Typical Express.js application:
 */
/*
app.use(cors());                    // Enable CORS
app.use(helmet());                  // Security headers
app.use(compression());             // Compress responses
app.use(express.json());            // Parse JSON body
app.use(morgan('combined'));        // HTTP logging
app.use(authenticate);              // Authentication
app.use(authorize);                 // Authorization
app.use('/api/users', userRoutes);  // Business logic
app.use(errorHandler);              // Error handling
*/

/**
 * KEY TAKEAWAYS:
 *
 * 1. MIDDLEWARE PATTERN: All handlers execute (not just first match)
 * 2. HIERARCHICAL CHAINS: Parent handlers execute before child handlers
 * 3. ASYNC SUPPORT: All handlers can be async
 * 4. COMMON PATTERN: Used in Express, Koa, Redux, etc.
 * 5. REQUEST PIPELINE: Transform request through multiple stages
 * 6. RESPONSE GENERATION: Multiple handlers contribute to response
 *
 * DIFFERENCES FROM CLASSIC CHAIN OF RESPONSIBILITY:
 *
 * Classic CoR (1-3.js):
 * - ONE handler processes request
 * - Chain stops when handler processes
 * - Handler decides: handle OR pass
 *
 * Middleware (4.js):
 * - ALL handlers process request
 * - Chain continues until end or explicit stop
 * - Handlers collaborate to build response
 *
 * WHEN TO USE MIDDLEWARE PATTERN:
 * ✅ HTTP request/response processing
 * ✅ Logging, authentication, authorization
 * ✅ Request transformation pipelines
 * ✅ Multiple operations needed on same data
 * ✅ Cross-cutting concerns (logging, metrics)
 *
 * WHEN TO USE CLASSIC CHAIN:
 * ✅ Need ONE handler to process request
 * ✅ Handler selection based on criteria
 * ✅ Early exit after successful handling
 * ✅ Fallback chain (try handler1, then handler2...)
 *
 * PATTERN EVOLUTION SUMMARY:
 *
 * 1-theory.js:  Classic OOP Chain → First match processes
 * 2-simple.js:  Functional Chain → First match processes
 * 3-adder.js:   Type-based Chain → First match processes
 * 4-server.js:  Middleware Chain → All execute (different variant!)
 *
 * Both are "Chain of Responsibility" but different execution semantics!
 */
