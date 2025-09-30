# Ticketing Application - CI/CD Pipeline

A complete microservices-based ticketing platform built with Node.js, TypeScript, React, and Kubernetes, now featuring a comprehensive CI/CD pipeline using GitHub Actions with deployment to DigitalOcean Kubernetes.

## What's Changed from Version 21 (Back to the Client)

Version 22 builds upon the full-stack application established in version 21, adding a production-grade CI/CD pipeline:

### CI/CD Pipeline with GitHub Actions

- **Testing Workflows**: Added automated testing for each service triggered on pull requests

  ```yaml
  # in .github/workflows/tests-auth.yml
  name: tests-auth

  on:
    pull_request:
      paths:
        - 'auth/**'

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - run: cd auth && npm install && npm run test:ci
  ```

- **Deployment Workflows**: Added automated deployment to DigitalOcean Kubernetes

  ```yaml
  # in .github/workflows/deploy-auth.yaml
  name: deploy-auth

  on:
    push:
      branches:
        - main
      paths:
        - 'auth/**'

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
          env:
            DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
            DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
        - run: cd auth && docker build -t rallycoding/auth .
        - run: docker push rallycoding/auth
        - uses: digitalocean/action-doctl@v2
          with:
            token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
        - run: doctl kubernetes cluster kubeconfig save ticketing
        - run: kubectl rollout restart deployment auth-depl
  ```

### Production Environment Configuration

- **Production Kubernetes Manifests**: Added separate deployment configuration for production

  ```yaml
  # in infra/k8s-prod/ingress-srv.yaml
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: ingress-service
    annotations:
      kubernetes.io/ingress.class: nginx
      nginx.ingress.kubernetes.io/use-regex: "true"
  spec:
    rules:
      - host: www.YOURDOMAIN.com
        http:
          paths:
            # Routing paths to different services
  ```

- **Production-specific LoadBalancer**: Configured for cloud deployment

  ```yaml
  # in infra/k8s-prod/ingress-srv.yaml (continued)
  apiVersion: v1
  kind: Service
  metadata:
    annotations:
      service.beta.kubernetes.io/do-loadbalancer-enable-proxy-protocol: "true"
      service.beta.kubernetes.io/do-loadbalancer-hostname: "www.YOURDOMAIN.com"
    # ... other metadata
  spec:
    type: LoadBalancer
    externalTrafficPolicy: Local
    # ... other specifications
  ```

### Infrastructure as Code

- **Manifest Deployment Workflow**: Added automated Kubernetes manifest deployment

  ```yaml
  # in .github/workflows/deploy-manifests.yaml
  name: deploy-manifests

  on:
    push:
      branches:
        - main
      paths:
        - 'infra/**'

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: digitalocean/action-doctl@v2
          with:
            token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
        - run: doctl kubernetes cluster kubeconfig save ticketing
        - run: kubectl apply -f infra/k8s && kubectl apply -f infra/k8s-prod
  ```

## Complete CI/CD Architecture

The CI/CD pipeline integrates with the existing microservices architecture:

```mermaid
graph TD
    subgraph "Developer Workflow"
        Dev["Developer"] -->|"Create Feature Branch"| GitRepo["GitHub Repository"]
        Dev -->|"Create Pull Request"| PR["Pull Request"]
    end
    
    subgraph "CI Pipeline"
        PR -->|"Trigger"| TestWorkflows["Test Workflows"]
        TestWorkflows -->|"Run Tests"| TestResults["Test Results"]
        TestResults -->|"Pass/Fail"| PR
    end
    
    subgraph "CD Pipeline"
        PR -->|"Merge to Main"| MergeToMain["Main Branch"]
        MergeToMain -->|"Trigger"| BuildWorkflows["Build & Deploy Workflows"]
        BuildWorkflows -->|"Build Docker Images"| DockerHub["Docker Hub"]
        BuildWorkflows -->|"Update Deployments"| DOKubernetes["DigitalOcean Kubernetes"]
    end
    
    subgraph "Production Environment"
        DOKubernetes --> Ingress["Ingress Controller"]
        
        Ingress --> AuthSvc["Auth Service"]
        Ingress --> TicketsSvc["Tickets Service"]
        Ingress --> OrdersSvc["Orders Service"]
        Ingress --> PaymentsSvc["Payments Service"]
        Ingress --> ClientSvc["Client App"]
        
        NATS["NATS Streaming"] <--> AuthSvc
        NATS <--> TicketsSvc
        NATS <--> OrdersSvc
        NATS <--> PaymentsSvc
        NATS <--> ExpirationSvc["Expiration Service"]
        
        Redis[(Redis)] --- ExpirationSvc
    end
    
    style Dev fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style GitRepo fill:#0d47a1,stroke:#fff,stroke-width:1px,color:#fff
    style PR fill:#0d47a1,stroke:#fff,stroke-width:1px,color:#fff
    style MergeToMain fill:#0d47a1,stroke:#fff,stroke-width:1px,color:#fff
    style TestWorkflows fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style TestResults fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style BuildWorkflows fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style DockerHub fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style DOKubernetes fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style Ingress fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style AuthSvc fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style TicketsSvc fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style OrdersSvc fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style PaymentsSvc fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style ClientSvc fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style ExpirationSvc fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style NATS fill:#6a1b9a,stroke:#fff,stroke-width:1px,color:#fff
    style Redis fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
```

## GitHub Actions Workflow Structure

The GitHub Actions workflows are divided into testing and deployment categories:

```mermaid
flowchart TD
    subgraph "Pull Request Workflows"
        PR[Pull Request] --> TestAuth["tests-auth.yml"]
        PR --> TestTickets["tests-tickets.yaml"]
        PR --> TestOrders["tests-orders.yaml"]
        PR --> TestPayments["tests-payments.yaml"]
    end

    subgraph "Main Branch Workflows"
        Main[Push to Main] --> DeployAuth["deploy-auth.yaml"]
        Main --> DeployTickets["deploy-tickets.yaml"]
        Main --> DeployOrders["deploy-orders.yaml"]
        Main --> DeployPayments["deploy-payments.yaml"]
        Main --> DeployClient["deploy-client.yaml"]
        Main --> DeployExpiration["deploy-expiration.yaml"]
        Main --> DeployInfra["deploy-manifests.yaml"]
    end
    
    TestAuth --> TestDecision{Tests Pass?}
    TestTickets --> TestDecision
    TestOrders --> TestDecision
    TestPayments --> TestDecision
    
    TestDecision -->|Yes| MergePR[Merge PR]
    TestDecision -->|No| RejectPR[Fix Issues]
    
    MergePR --> Main
    
    DeployAuth --> BuildDockerImage[Build Docker Image]
    DeployTickets --> BuildDockerImage
    DeployOrders --> BuildDockerImage
    DeployPayments --> BuildDockerImage
    DeployClient --> BuildDockerImage
    DeployExpiration --> BuildDockerImage
    
    BuildDockerImage --> PushDockerHub[Push to Docker Hub]
    PushDockerHub --> UpdateDeployment[Update Kubernetes Deployment]
    
    DeployInfra --> ApplyManifests[Apply Kubernetes Manifests]
    
    style PR fill:#0d47a1,stroke:#fff,stroke-width:1px,color:#fff
    style Main fill:#0d47a1,stroke:#fff,stroke-width:1px,color:#fff
    style TestAuth fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style TestTickets fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style TestOrders fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style TestPayments fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style TestDecision fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style MergePR fill:#0d47a1,stroke:#fff,stroke-width:1px,color:#fff
    style RejectPR fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style DeployAuth fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style DeployTickets fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style DeployOrders fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style DeployPayments fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style DeployClient fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style DeployExpiration fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style DeployInfra fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style BuildDockerImage fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style PushDockerHub fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style UpdateDeployment fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style ApplyManifests fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
```

## Testing Pipeline Workflow

Each service has its own testing workflow triggered by pull requests:

```mermaid
sequenceDiagram
    participant Developer
    participant GitHub
    participant Runner as GitHub Runner
    participant Tests as Service Tests
    
    Developer->>GitHub: Create Pull Request
    Note over GitHub: PR affects service files
    GitHub->>Runner: Trigger test workflow
    Runner->>Runner: Checkout repository
    Runner->>Runner: cd into service directory
    Runner->>Runner: npm install
    Runner->>Tests: npm run test:ci
    
    alt Tests Pass
        Tests->>Runner: Success exit code
        Runner->>GitHub: Report success
        GitHub->>GitHub: Allow merge
    else Tests Fail
        Tests->>Runner: Error exit code
        Runner->>GitHub: Report failure
        GitHub->>GitHub: Block merge
    end
```

## Deployment Pipeline Workflow

Each service has its own deployment workflow triggered by pushes to main:

```mermaid
sequenceDiagram
    participant Developer
    participant GitHub
    participant Runner as GitHub Runner
    participant DockerHub
    participant DO as DigitalOcean
    participant K8s as Kubernetes Cluster
    
    Developer->>GitHub: Merge PR to main
    Note over GitHub: Push affects service files
    GitHub->>Runner: Trigger deploy workflow
    Runner->>Runner: Checkout repository
    
    Runner->>DockerHub: Docker login
    Runner->>Runner: Build Docker image
    Runner->>DockerHub: Push image
    
    Runner->>DO: Authenticate with doctl
    DO->>Runner: Return Kubernetes config
    Runner->>K8s: kubectl rollout restart deployment
    K8s->>K8s: Pull latest image
    K8s->>K8s: Update service pods
```

## Infrastructure Deployment Workflow

Changes to Kubernetes manifests trigger a deployment workflow:

```mermaid
sequenceDiagram
    participant Developer
    participant GitHub
    participant Runner as GitHub Runner
    participant DO as DigitalOcean
    participant K8s as Kubernetes Cluster
    
    Developer->>GitHub: Push changes to infra/
    GitHub->>Runner: Trigger deploy-manifests workflow
    Runner->>Runner: Checkout repository
    
    Runner->>DO: Authenticate with doctl
    DO->>Runner: Return Kubernetes config
    Runner->>K8s: kubectl apply -f infra/k8s
    Runner->>K8s: kubectl apply -f infra/k8s-prod
    K8s->>K8s: Apply manifest changes
```

## Development vs. Production Environment

The application now has distinct configurations for development and production:

```mermaid
graph TB
    subgraph "Development Environment"
        DevSkaffold["Skaffold"]
        DevDocker["Local Docker"]
        DevK8s["Local Kubernetes"]
        DevIngress["Ingress (ticketing.dev)"]
    end
    
    subgraph "Production Environment"
        DOCluster["DigitalOcean Kubernetes Cluster"]
        ProdIngress["Ingress (YOURDOMAIN.com)"]
        ProdLB["LoadBalancer Service"]
        DockerHub["Docker Hub"]
        GitHubActions["GitHub Actions"]
    end
    
    Developer -->|"Local Development"| DevSkaffold
    DevSkaffold -->|"Build & Deploy"| DevDocker
    DevDocker --> DevK8s
    DevK8s --> DevIngress
    
    Developer -->|"Push to GitHub"| GitHubActions
    GitHubActions -->|"Build Images"| DockerHub
    GitHubActions -->|"Deploy"| DOCluster
    DOCluster --> ProdIngress
    ProdIngress --> ProdLB
    DockerHub -->|"Pull Images"| DOCluster
    
    style Developer fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style DevSkaffold fill:#26a69a,stroke:#fff,stroke-width:1px,color:#fff
    style DevDocker fill:#26a69a,stroke:#fff,stroke-width:1px,color:#fff
    style DevK8s fill:#26a69a,stroke:#fff,stroke-width:1px,color:#fff
    style DevIngress fill:#26a69a,stroke:#fff,stroke-width:1px,color:#fff
    style DOCluster fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style ProdIngress fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style ProdLB fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style DockerHub fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style GitHubActions fill:#0d47a1,stroke:#fff,stroke-width:1px,color:#fff
```

## Complete System Architecture with CI/CD

The complete ticketing application architecture with CI/CD pipeline:

```mermaid
graph TD
    subgraph "Development & CI/CD"
        Developer["Developer"]
        GitRepo["GitHub Repository"]
        Actions["GitHub Actions"]
        Docker["Docker Hub"]
    end
    
    subgraph "Kubernetes Cluster"
        Ingress["Ingress Controller"]
        
        subgraph "Services"
            Auth["Auth Service"]
            Tickets["Tickets Service"]
            Orders["Orders Service"]
            Payments["Payments Service"]
            Client["Client App"]
            Expiration["Expiration Service"]
        end
        
        subgraph "Data & Messaging"
            NATS["NATS Streaming"]
            Mongo["MongoDB Services"]
            Redis["Redis"]
        end
    end
    
    Developer -->|"Code Changes"| GitRepo
    GitRepo -->|"Trigger Workflows"| Actions
    Actions -->|"Build & Push"| Docker
    Actions -->|"Deploy"| Ingress
    
    Docker -->|"Images"| Auth & Tickets & Orders & Payments & Client & Expiration
    
    Ingress --> Auth & Tickets & Orders & Payments & Client
    
    Auth --> Mongo
    Tickets --> Mongo
    Orders --> Mongo
    Payments --> Mongo
    
    Tickets <--> NATS
    Orders <--> NATS
    Payments <--> NATS
    Expiration <--> NATS
    
    Expiration --> Redis
    
    style Developer fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style GitRepo fill:#0d47a1,stroke:#fff,stroke-width:1px,color:#fff
    style Actions fill:#0d47a1,stroke:#fff,stroke-width:1px,color:#fff
    style Docker fill:#d81b60,stroke:#fff,stroke-width:1px,color:#fff
    style Ingress fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style Auth fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style Tickets fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style Orders fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style Payments fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style Client fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style Expiration fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style NATS fill:#6a1b9a,stroke:#fff,stroke-width:1px,color:#fff
    style Mongo fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style Redis fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
```

## End-to-End Workflow

The complete workflow from development to production deployment:

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Local as Local Dev Environment
    participant Git as GitHub
    participant CI as CI Pipeline
    participant CD as CD Pipeline
    participant Prod as Production Environment
    
    Dev->>Local: Write Code & Tests
    Local->>Local: Test Locally (Skaffold)
    Dev->>Git: Create Feature Branch
    Dev->>Git: Submit Pull Request
    
    Git->>CI: Trigger Test Workflows
    CI->>CI: Run Service Tests
    
    alt Tests Pass
        CI->>Git: Report Success
        Git->>Git: Allow Merge
        Dev->>Git: Merge to Main
        
        Git->>CD: Trigger Deploy Workflows
        CD->>CD: Build Docker Images
        CD->>CD: Push to Docker Hub
        CD->>CD: Update K8s Deployments
        
        CD->>Prod: Deploy to Production
        Prod->>Prod: Pull Latest Images
        Prod->>Prod: Update Services
        
        Prod->>Dev: Deployment Complete
    else Tests Fail
        CI->>Git: Report Failure
        Git->>Git: Block Merge
        Git->>Dev: Fix Issues
    end
```

## Setting Up the CI/CD Pipeline

### Prerequisites

1. **GitHub Repository** for your code
2. **Docker Hub Account** for hosting images
3. **DigitalOcean Account** with Kubernetes cluster
4. **Domain Name** configured for your application

### GitHub Secrets Configuration

Setup the following repository secrets in GitHub:

1. `DOCKER_USERNAME`: Your Docker Hub username
2. `DOCKER_PASSWORD`: Your Docker Hub password
3. `DIGITALOCEAN_ACCESS_TOKEN`: API token for DigitalOcean

### Production Deployment Steps

1. **Initial Cluster Setup**:

   ```bash
   # Install doctl
   brew install doctl  # For Mac, use appropriate command for your OS
   
   # Authenticate with DigitalOcean
   doctl auth init
   
   # Create Kubernetes cluster
   doctl kubernetes cluster create ticketing --region nyc1 --size s-2vcpu-4gb --count 3
   
   # Configure kubectl
   doctl kubernetes cluster kubeconfig save ticketing
   ```

2. **Deploy Kubernetes Resources**:

   ```bash
   # Create secrets in production
   kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_jwt_secret_key
   kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=your_stripe_secret_key
   
   # Update domain name in manifests
   # Edit infra/k8s-prod/ingress-srv.yaml and update YOURDOMAIN.com
   
   # Apply manifests
   kubectl apply -f infra/k8s
   kubectl apply -f infra/k8s-prod
   ```

3. **Configure Domain**:
   - Point your domain to the DigitalOcean LoadBalancer IP
   - Configure DNS settings in your domain registrar

### Development Workflow

1. **Local Development**:

   ```bash
   # Start local development environment
   skaffold dev
   ```

2. **Feature Development**:
   - Create feature branch
   - Make changes to service(s)
   - Run tests locally
   - Push branch to GitHub
   - Create a pull request

3. **Code Review & CI**:
   - GitHub Actions automatically runs tests
   - Fix any failing tests
   - Get code review approvals
   - Merge pull request to main branch

4. **Automatic Deployment**:
   - GitHub Actions automatically builds and deploys changes
   - Monitor deployment status in GitHub Actions
   - Verify changes in production

## GitHub Actions Configuration

### Testing Workflow Example

```yaml
name: tests-auth

on:
  pull_request:
    paths:
      - 'auth/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd auth && npm install && npm run test:ci
```

### Deployment Workflow Example

```yaml
name: deploy-auth

on:
  push:
    branches:
      - main
    paths:
      - 'auth/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
      - run: cd auth && docker build -t rallycoding/auth .
      - run: docker push rallycoding/auth
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - run: doctl kubernetes cluster kubeconfig save ticketing
      - run: kubectl rollout restart deployment auth-depl
```

### Infrastructure Deployment Workflow

```yaml
name: deploy-manifests

on:
  push:
    branches:
      - main
    paths:
      - 'infra/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - run: doctl kubernetes cluster kubeconfig save ticketing
      - run: kubectl apply -f infra/k8s && kubectl apply -f infra/k8s-prod
```

## Key Differences Between Development and Production

| Feature | Development | Production |
|---------|-------------|------------|
| **Environment** | Local Kubernetes | DigitalOcean Kubernetes |
| **Domain** | ticketing.dev | <www.YOURDOMAIN.com> |
| **Deployment** | Skaffold | GitHub Actions |
| **Docker Images** | Built locally | Pushed to Docker Hub |
| **Ingress** | Local NGINX | LoadBalancer service |
| **Configuration** | k8s/ | k8s/ + k8s-prod/ |
| **Secrets** | Local | Production Kubernetes secrets |

## Conclusion

Version 22 completes the ticketing application by adding a comprehensive CI/CD pipeline for automated testing and deployment. The GitHub Actions workflows provide a robust system for ensuring code quality through automated testing on pull requests, and streamlined deployment through automated builds and updates to the production Kubernetes cluster. This architecture demonstrates a modern approach to deploying microservices applications in a production environment with proper CI/CD practices.

The addition of separate configurations for development and production environments ensures a clear separation of concerns, allowing developers to work efficiently locally while maintaining a stable and scalable production deployment. The infrastructure-as-code approach, with all Kubernetes manifests and deployment configurations tracked in version control, provides reproducibility and transparency in the deployment process.
