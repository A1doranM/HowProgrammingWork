# Kubernetes Configuration for Blog Microservices

This directory contains all the Kubernetes manifests that define the infrastructure for our blog microservices application. Each file describes the deployment and service configurations for a specific microservice or infrastructure component.

## Understanding Kubernetes Resources

Our application uses several Kubernetes resource types:

1. **Deployments**: Define how pods should be created and updated
2. **Services**: Enable network access to a set of pods
   - **ClusterIP**: For internal cluster communication
   - **NodePort**: For direct external access to a service
3. **Ingress**: Manages external access to services within the cluster

## Service Configuration Map

| Service      | Deployment File      | Service Name(s)           | Port | Access Pattern                 |
|--------------|----------------------|---------------------------|------|-------------------------------|
| Client       | client-depl.yaml     | client-srv                | 3000 | Via Ingress /* route          |
| Posts        | posts-depl.yaml      | posts-clusterip-srv       | 4000 | Via Ingress /posts/create     |
| Posts        | posts-srv.yaml       | posts-srv (NodePort)      | 4000 | Direct external (debugging)   |
| Comments     | comments-depl.yaml   | comments-srv              | 4001 | Via Ingress /posts/*/comments |
| Query        | query-depl.yaml      | query-srv                 | 4002 | Via Ingress /posts            |
| Event Bus    | event-bus-depl.yaml  | event-bus-srv             | 4005 | Internal only                 |
| Moderation   | moderation-depl.yaml | moderation-srv            | 4003 | Internal only                 |

## Deployment and Service Configuration

Each microservice typically has a configuration file that defines both a Deployment and a ClusterIP Service. For example:

```yaml
# Example: Basic structure of a deployment + service file
apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-depl  # The deployment name
spec:
  replicas: 1  # Number of pod replicas
  selector:
    matchLabels:
      app: service  # Selector for pods managed by this deployment
  template:
    metadata:
      labels:
        app: service  # Label for pods created by this template
    spec:
      containers:
        - name: service  # Container name
          image: registry/service:tag  # Container image
---
apiVersion: v1
kind: Service
metadata:
  name: service-srv  # The service name
spec:
  selector:
    app: service  # Selector for pods this service exposes
  ports:
    - name: service
      protocol: TCP
      port: 3000  # Port on the service
      targetPort: 3000  # Port on the container
```

Each deployment file follows this structure, with service-specific details:

- Unique deployment and service names
- Specific container images
- Appropriate port configuration

## ClusterIP vs NodePort Services

Our application uses two types of Kubernetes services:

1. **ClusterIP Services** (the default type):
   - Only accessible within the Kubernetes cluster
   - Used for internal communication between microservices
   - Named with the pattern `[service]-clusterip-srv` or `[service]-srv`

2. **NodePort Service** (only for Posts service):
   - Exposes the service on each Node's IP at a static port
   - Allows direct external access for debugging purposes
   - Defined in a separate `posts-srv.yaml` file

## Service Discovery and Communication

Kubernetes provides DNS-based service discovery. Services can communicate with each other using their service names:

```
http://[service-name]:[port]
```

For example, the Posts service can send events to the Event Bus using:

```
http://event-bus-srv:4005/events
```

This eliminates the need for hardcoded IP addresses and enables dynamic scaling and replacement of pods.

## Ingress Configuration

The `ingress-srv.yaml` file defines how external traffic is routed to the appropriate services:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: posts.com  # Host domain for the ingress
      http:
        paths:
          - path: /posts/create  # Route for creating posts
            pathType: Prefix
            backend:
              service:
                name: posts-clusterip-srv
                port:
                  number: 4000
          - path: /posts  # Route for querying posts
            pathType: Prefix
            backend:
              service:
                name: query-srv
                port:
                  number: 4002
          - path: /posts/?(.*)/comments  # Route for comments
            pathType: ImplementationSpecific
            backend:
              service:
                name: comments-srv
                port:
                  number: 4001
          - path: /?(.*)  # Default route to client
            pathType: ImplementationSpecific
            backend:
              service:
                name: client-srv
                port:
                  number: 3000
```

Key aspects of the Ingress configuration:

- Uses the NGINX Ingress Controller (specified by `ingressClassName: nginx`)
- Enables regex in paths with the annotation `nginx.ingress.kubernetes.io/use-regex: "true"`
- Routes traffic based on the URL path to different services
- All traffic is directed to `posts.com` (requires hosts file configuration)

## Path-Based Routing

The Ingress controller routes traffic to different services based on the URL path:

| Path Pattern         | Service               | Purpose                         |
|----------------------|-----------------------|---------------------------------|
| /posts/create        | posts-clusterip-srv   | Creating new posts              |
| /posts               | query-srv             | Getting all posts and comments  |
| /posts/*/comments    | comments-srv          | Adding comments to posts        |
| /*                   | client-srv            | Serving the frontend application|

The order of paths in the Ingress configuration is important. More specific paths should come before more general ones to ensure correct routing.

## Network Flow Between Services

1. **External User → Ingress → Frontend/Backend Services**
   - External users access the application via the Ingress at posts.com
   - Ingress routes requests to appropriate services based on the path

2. **Service → Service Communication (Event-Based)**
   - Services communicate with each other through the Event Bus
   - Example flow for creating a post:
     - Posts service creates a post
     - Posts service emits a "PostCreated" event to Event Bus
     - Event Bus broadcasts to all services
     - Query service stores the post data

3. **Client → Backend Communication**
   - Client makes API requests to backend services via the Ingress
   - Ingress routes these requests to the appropriate service

## Modifying and Extending Configurations

When adding new features or services:

1. **Create a new deployment file** following the pattern of existing ones
2. **Add appropriate service definitions** (ClusterIP for internal, NodePort if external direct access is needed)
3. **Update the Ingress configuration** if the new service needs external access
4. **Update the Skaffold configuration** to include the new service for development

## Deployment Strategy

Our current deployment strategy is simple:

- Each service has a single replica (`replicas: 1`)
- Services use pre-built images from Docker Hub
- No resource limits or health checks are defined (these would be added in a production environment)

For a production deployment, consider:

- Increasing the replica count for better availability
- Adding resource requests and limits
- Implementing health checks (readiness and liveness probes)
- Setting up Horizontal Pod Autoscalers
