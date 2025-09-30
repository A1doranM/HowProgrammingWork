# Blog Microservices Application with Docker

This project is an evolution of the Mini Microservices Blog Application, now containerized with Docker. It demonstrates how to run a microservices architecture in containers, enabling better isolation, dependency management, and deployment consistency.

## Changes from Version 1 to Version 2

The primary enhancement in this version is the addition of Docker containerization:

1. **Dockerfiles Added**: Each service now has its own Dockerfile that defines how to build the container
2. **Docker Ignore Files**: Added .dockerignore files to prevent unnecessary files (like node_modules) from being included in containers
3. **Service Independence**: Each service is now fully containerized and can be built, deployed, and scaled independently

While the application functionality remains largely unchanged, the containerization represents a significant architectural improvement for deployment and scaling.

## Docker Implementation

Each service follows a similar containerization pattern:

```dockerfile
FROM node:alpine

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

CMD ["npm", "start"]
```

This pattern:

1. Uses the lightweight Node.js Alpine image
2. Sets up a working directory in the container
3. Copies package.json first to leverage Docker layer caching for dependencies
4. Installs dependencies
5. Copies the rest of the application code
6. Defines the command to run the service

The `.dockerignore` files exclude:

- `node_modules` (to avoid copying local dependencies)
- `package-lock.json` (to ensure clean dependency installation)

## Architecture Overview

The application follows an event-driven microservices architecture where each service is responsible for a specific domain and communicates with other services via an event bus.

### Services

| Service | Port | Purpose |
|---------|------|---------|
| **Client** | 3000 | React frontend that displays posts and comments |
| **Posts** | 4000 | Creates and manages blog posts |
| **Comments** | 4001 | Creates and manages comments on posts |
| **Query** | 4002 | Aggregates data for efficient reads |
| **Moderation** | 4003 | Moderates comment content |
| **Event Bus** | 4005 | Facilitates communication between services |

Each service is now containerized, providing:

- **Isolation**: Services run in separate environments
- **Dependency Management**: Each container packages its own dependencies
- **Consistency**: Identical environments in development and production
- **Scalability**: Easy horizontal scaling of individual services

## Event Flow

The application follows the same event flow as version 1:

1. User creates a post through the client
2. Posts service creates a post and emits a "PostCreated" event
3. Event bus broadcasts the event to all services
4. Query service stores the post data for efficient reads

Similarly for comments:

1. User adds a comment through the client
2. Comments service creates a comment with "pending" status and emits a "CommentCreated" event
3. Event bus broadcasts the event to all services
4. Moderation service receives the event and checks the comment content
5. Moderation service emits a "CommentModerated" event (approved/rejected)
6. Comments service updates the comment status and emits a "CommentUpdated" event
7. Query service updates its data with the final comment status

## Running the Application

### Prerequisites

- Docker installed on your machine

### Steps to Run

1. **Build the Docker images** for each service:

   ```bash
   cd client
   docker build -t blog/client .
   
   cd ../posts
   docker build -t blog/posts .
   
   cd ../comments
   docker build -t blog/comments .
   
   cd ../query
   docker build -t blog/query .
   
   cd ../moderation
   docker build -t blog/moderation .
   
   cd ../event-bus
   docker build -t blog/event-bus .
   ```

2. **Run each service** in a separate container:

   ```bash
   docker run -p 3000:3000 blog/client
   docker run -p 4000:4000 blog/posts
   docker run -p 4001:4001 blog/comments
   docker run -p 4002:4002 blog/query
   docker run -p 4003:4003 blog/moderation
   docker run -p 4005:4005 blog/event-bus
   ```

3. **Access the application** at <http://localhost:3000>

## Current Limitations and Next Steps

This Docker implementation is a step forward but still has some limitations:

1. **Service Discovery**: Services still communicate via hardcoded localhost addresses
2. **Docker Compose**: A Docker Compose file would simplify running multiple containers
3. **Container Networking**: Custom network configuration would improve service communication
4. **Persistent Storage**: Data is still stored in memory and lost when containers restart
5. **Kubernetes**: For production, Kubernetes would provide better orchestration

These limitations will be addressed in future versions of the application.

## Data Management

Each service maintains its own data store, just as in version 1:

- **Posts Service**: Stores posts in memory
- **Comments Service**: Stores comments in memory, organized by post ID
- **Query Service**: Combines posts and comments data for efficient reads
- **Event Bus**: Maintains a history of all events

Data consistency across services is maintained through events, with the added benefit that Docker provides consistent environments for each service.

## Key Learning Points

This containerized version demonstrates several important concepts:

1. **Docker Containerization**: Packaging services with their dependencies
2. **Service Independence**: Each service can be built and deployed independently
3. **Environment Consistency**: Identical environments across development and production
4. **Resource Isolation**: Services run in separate containers with their own resources
5. **Simplified Deployment**: Containerized services are easier to deploy

## Advanced Docker Features (Future Improvements)

Future enhancements could include:

1. **Docker Compose**: For orchestrating multi-container applications
2. **Docker Networks**: For isolated service communication
3. **Docker Volumes**: For persistent data storage
4. **Health Checks**: For better container monitoring
5. **Multi-stage Builds**: For optimized production images
6. **Container Orchestration**: Using Kubernetes for production deployment
