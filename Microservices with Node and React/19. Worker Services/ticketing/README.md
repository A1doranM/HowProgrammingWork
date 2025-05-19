# Ticketing Application - Worker Services

A microservices-based ticketing platform built with Node.js, TypeScript, and Kubernetes, now featuring a dedicated worker service for handling order expirations using job queues.

## What's Changed from Version 18 (Listening for Events and Handling Concurrency Issues)

Version 19 builds upon the bi-directional event flow architecture established in version 18, adding a dedicated worker service for handling time-dependent operations:

### New Expiration Service

- **Worker Service Pattern**: Added a dedicated service that exclusively processes background tasks

  ```typescript
  // in expiration/src/index.ts
  const start = async () => {
    // Connect to NATS
    await natsWrapper.connect(/* ... */);
    
    // Start listening for events
    new OrderCreatedListener(natsWrapper.client).listen();
  };
  
  start();
  ```

- **Bull.js Job Queue with Redis**: Implemented delayed job processing using Bull.js and Redis

  ```typescript
  // in expiration/src/queues/expiration-queue.ts
  import Queue from 'bull';
  import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
  import { natsWrapper } from '../nats-wrapper';

  interface Payload {
    orderId: string;
  }

  const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
      host: process.env.REDIS_HOST,
    },
  });

  expirationQueue.process(async (job) => {
    new ExpirationCompletePublisher(natsWrapper.client).publish({
      orderId: job.data.orderId,
    });
  });

  export { expirationQueue };
  ```

### Order Expiration Workflow

- **Expiration Scheduling**: Automatic scheduling of order expiration based on creation time

  ```typescript
  // in expiration/src/events/listeners/order-created-listener.ts
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job:', delay);

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );

    msg.ack();
  }
  ```

- **Automatic Order Cancellation**: Handling expiration events to cancel orders

  ```typescript
  // in orders/src/events/listeners/expiration-complete-listener.ts
  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
  ```

### New Event Types

- **Expiration Complete Event**: Added new event for order expiration notifications

  ```typescript
  // in common/src/events/expiration-complete-event.ts
  export interface ExpirationCompleteEvent {
    subject: Subjects.ExpirationComplete;
    data: {
      orderId: string;
    };
  }
  
  // in common/src/events/subjects.ts
  export enum Subjects {
    // ...existing subjects
    ExpirationComplete = 'expiration:complete',
  }
  ```

### New Infrastructure Components

- **Redis Deployment**: Added Redis for Bull.js job queue persistence
- **Expiration Service Deployment**: Kubernetes deployment for the new worker service

## Architecture Overview

The application has evolved to include a worker service pattern for handling background tasks:

```mermaid
graph TD
    subgraph "Client Application"
        ClientApp["Next.js Frontend"]
    end
    
    subgraph "API Gateway"
        Ingress["Ingress Controller"]
    end
    
    subgraph "Auth Service"
        AuthAPI["Auth API"]
        AuthDB[(Auth MongoDB)]
        AuthAPI --- AuthDB
    end
    
    subgraph "Tickets Service"
        TicketsAPI["Tickets API"]
        TicketsDB[(Tickets MongoDB)]
        TicketPublishers["Ticket Publishers"]
        TicketListeners["Ticket Listeners"]
        
        TicketsAPI --- TicketsDB
        TicketsAPI --> TicketPublishers
        TicketListeners --> TicketsAPI
    end
    
    subgraph "Orders Service"
        OrdersAPI["Orders API"]
        OrdersDB[(Orders MongoDB)]
        ReplicatedTickets["Replicated Tickets"]
        OrderPublishers["Order Publishers"]
        OrderListeners["Order Listeners"]
        ExpirationListener["Expiration Listener"]
        
        OrdersAPI --- OrdersDB
        OrdersAPI --- ReplicatedTickets
        OrdersAPI --> OrderPublishers
        OrderListeners --> OrdersAPI
        OrderListeners --> ReplicatedTickets
        ExpirationListener --> OrdersAPI
    end
    
    subgraph "Expiration Service"
        OrderCreatedListener["Order Created Listener"]
        JobQueue["Job Queue (Bull.js)"]
        ExpirationPublisher["Expiration Publisher"]
        
        OrderCreatedListener --> JobQueue
        JobQueue --> ExpirationPublisher
    end
    
    subgraph "Data Stores"
        Redis[(Redis)]
        JobQueue --- Redis
    end
    
    subgraph "Message Broker"
        NATS["NATS Streaming"]
    end
    
    ClientApp -- "HTTP Requests" --> Ingress
    Ingress -- "/api/users/*" --> AuthAPI
    Ingress -- "/api/tickets/*" --> TicketsAPI
    Ingress -- "/api/orders/*" --> OrdersAPI
    
    TicketPublishers -- "Ticket Events" --> NATS
    OrderPublishers -- "Order Events" --> NATS
    ExpirationPublisher -- "Expiration Events" --> NATS
    
    NATS -- "Ticket Events" --> OrderListeners
    NATS -- "Order Events" --> TicketListeners
    NATS -- "Order Events" --> OrderCreatedListener
    NATS -- "Expiration Events" --> ExpirationListener
    
    style ClientApp fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style Ingress fill:#fb8c00,stroke:#fff,stroke-width:1px,color:#fff
    style AuthAPI fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style TicketsAPI fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style OrdersAPI fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style AuthDB fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style TicketsDB fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style OrdersDB fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style Redis fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style NATS fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style TicketPublishers fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style OrderPublishers fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style ExpirationPublisher fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style TicketListeners fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style OrderListeners fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style OrderCreatedListener fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style ExpirationListener fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style JobQueue fill:#9c27b0,stroke:#fff,stroke-width:1px,color:#fff
    style ReplicatedTickets fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
```

### Components Explained

- **Client Application**: Next.js frontend for user interactions
- **API Gateway**: Ingress controller routing requests to appropriate services
- **Auth Service**: Handles user authentication and authorization
- **Tickets Service**: Manages ticket creation and updates
- **Orders Service**: Manages order creation and cancellation, listens for expiration events
- **Expiration Service**: Worker service that schedules and processes order expirations
- **Redis**: Persistence store for job queues
- **NATS Streaming**: Message broker for event-based communication

## Worker Service Pattern

The Expiration service demonstrates the Worker Service pattern, a specialized microservice dedicated to processing background tasks without external API endpoints:

```mermaid
graph TD
    A[Order Created Event] --> B[Expiration Service]
    B --> C{Calculate Delay}
    C --> D[Add Job to Queue]
    D --> E[(Redis)]
    E --> F[Job Processor]
    F --> G[Expiration Complete Event]
    G --> H[Order Service]
    H --> I[Cancel Order]
    I --> J[Order Cancelled Event]
    
    style A fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style B fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style C fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style D fill:#9c27b0,stroke:#fff,stroke-width:1px,color:#fff
    style E fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style F fill:#9c27b0,stroke:#fff,stroke-width:1px,color:#fff
    style G fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style H fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style I fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style J fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
```

### Key Characteristics

1. **No API Endpoints**: The service doesn't expose any HTTP endpoints
2. **Event-Driven**: Triggered exclusively through events
3. **Single Responsibility**: Focused solely on time-based operations
4. **Stateless Processing**: Doesn't maintain application state beyond the job queue
5. **Scalable**: Can be horizontally scaled for higher throughput

## Order Expiration Flow

The complete order expiration flow demonstrates the integration of the worker service pattern:

```mermaid
sequenceDiagram
    participant Client
    participant OrdersService
    participant NATS
    participant ExpirationService
    participant Redis
    participant TicketsService
    
    %% Order Creation Flow
    Client->>OrdersService: Create Order
    OrdersService->>OrdersService: Set expiration time (15 min)
    OrdersService->>OrdersService: Save Order
    OrdersService->>NATS: Publish OrderCreatedEvent
    
    %% Expiration Scheduling
    NATS->>ExpirationService: Deliver OrderCreatedEvent
    ExpirationService->>ExpirationService: Calculate delay time
    ExpirationService->>Redis: Schedule job with delay
    
    %% Time passes...
    Note over Redis: Wait for delay timer
    
    %% Job Processing
    Redis->>ExpirationService: Trigger job processing
    ExpirationService->>NATS: Publish ExpirationCompleteEvent
    
    %% Order Cancellation
    NATS->>OrdersService: Deliver ExpirationCompleteEvent
    OrdersService->>OrdersService: Set order status to Cancelled
    OrdersService->>NATS: Publish OrderCancelledEvent
    
    %% Ticket Update
    NATS->>TicketsService: Deliver OrderCancelledEvent
    TicketsService->>TicketsService: Remove reservation (orderId)
    TicketsService->>NATS: Publish TicketUpdatedEvent
    
    %% Order Ticket Update
    NATS->>OrdersService: Deliver TicketUpdatedEvent
    OrdersService->>OrdersService: Update ticket copy
```

## Job Queue Implementation

The Expiration service implements a job queue using Bull.js and Redis:

```mermaid
graph TD
    subgraph "Expiration Service"
        A[Order Created Listener] --> B["Calculate Delay<br>(expiresAt - now)"]
        B --> C["Queue.add(job, { delay })"]
        
        D["Queue.process(callback)"] --> E[Process Job]
        E --> F[Publish Expiration Complete Event]
    end
    
    subgraph "Redis"
        G[(Delayed Jobs)]
        H[(Active Jobs)]
        I[(Completed Jobs)]
    end
    
    C --> G
    G -- "After delay" --> H
    H --> D
    E --> I
    
    style A fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style B fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style C fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style D fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style E fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style F fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style G fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style H fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style I fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
```

### Job Queue Workflow

1. **Job Creation**: When an OrderCreatedEvent is received, a job is added to the queue with a delay
2. **Delay Calculation**: The delay is calculated as the time difference between the order expiration time and now
3. **Job Storage**: Redis stores the job in a sorted set, sorted by the time it should be executed
4. **Job Processing**: When the delay time elapses, the job is moved to the active queue and processed
5. **Event Publication**: Upon processing, an ExpirationCompleteEvent is published

## Complete Event Flow

The complete event flow now includes order expiration events:

```mermaid
graph TD
    subgraph "Client"
        A[Create Ticket] --> B[Create Order]
    end
    
    subgraph "Ticket Service Events"
        C[TicketCreatedEvent] --> D[TicketUpdatedEvent]
    end
    
    subgraph "Order Service Events"
        E[OrderCreatedEvent] --> F[OrderCancelledEvent]
    end
    
    subgraph "Expiration Service Events"
        G[ExpirationCompleteEvent]
    end
    
    A --> C
    B --> E
    E --> G
    G --> F
    F --> D
    
    style A fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style B fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style C fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style D fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style E fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style F fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style G fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
```

## Implementation Details

### Expiration Service Core Components

1. **OrderCreatedListener**: Listens for OrderCreatedEvents and schedules jobs
2. **ExpirationQueue**: Bull.js queue that manages delayed job processing
3. **ExpirationCompletePublisher**: Publishes events when jobs complete

### Bull.js Queue Configuration

```typescript
// in expiration/src/queues/expiration-queue.ts
import Queue from 'bull';

// Define job payload type
interface Payload {
  orderId: string;
}

// Create queue with Redis connection
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

// Define job processor
expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});
```

### Order Cancellation on Expiration

```typescript
// in orders/src/events/listeners/expiration-complete-listener.ts
export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
```

## Kubernetes Configuration

### Expiration Service Deployment

```yaml
# in infra/k8s/expiration-depl.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: expiration-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: expiration
  template:
    metadata:
      labels:
        app: expiration
    spec:
      containers:
        - name: expiration
          image: rallycoding/expiration
          env:
            - name: NATS_CLIENT_ID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: NATS_URL
              value: 'http://nats-srv:4222'
            - name: NATS_CLUSTER_ID
              value: ticketing
            - name: REDIS_HOST
              value: expiration-redis-srv
```

### Redis Deployment

```yaml
# in infra/k8s/expiration-redis-depl.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: expiration-redis-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: expiration-redis
  template:
    metadata:
      labels:
        app: expiration-redis
    spec:
      containers:
        - name: expiration-redis
          image: redis
---
apiVersion: v1
kind: Service
metadata:
  name: expiration-redis-srv
spec:
  selector:
    app: expiration-redis
  ports:
    - name: db
      protocol: TCP
      port: 6379
      targetPort: 6379
```

## Frontend and Backend Integration

The frontend integration remains unchanged, but the backend now includes the expiration workflow:

```mermaid
flowchart TD
    subgraph Client["Next.js Client Application"]
        A[Landing Page]
        B[Auth Pages]
        C[Ticket Pages]
        D[Order Pages]
        E[API Client]
        
        A --- E
        B --- E
        C --- E
        D --- E
    end
    
    subgraph Kubernetes["Kubernetes Cluster"]
        F[Ingress Controller]
        
        subgraph Services["API Services"]
            G[Auth Service]
            H[Tickets Service]
            I[Orders Service]
        end
        
        subgraph Background["Worker Services"]
            J[Expiration Service]
        end
        
        subgraph Databases["Persistent Storage"]
            K[(Auth MongoDB)]
            L[(Tickets MongoDB)]
            M[(Orders MongoDB)]
            N[(Redis)]
        end
        
        subgraph MessageBus["Event Bus"]
            O[NATS Streaming]
        end
        
        F --> G
        F --> H
        F --> I
        
        G --- K
        H --- L
        I --- M
        J --- N
        
        G <--> O
        H <--> O
        I <--> O
        J <--> O
    end
    
    E -- "HTTP Requests" --> F
    
    style A fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style B fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style C fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style D fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style E fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style F fill:#fb8c00,stroke:#fff,stroke-width:1px,color:#fff
    style G fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style H fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style I fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style J fill:#673ab7,stroke:#fff,stroke-width:1px,color:#fff
    style K fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style L fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style M fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style N fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style O fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
```

## Running the Application

### Prerequisites

1. **Docker Desktop** with Kubernetes enabled
2. **kubectl** command-line tool
3. **Skaffold** for development workflow
4. **Ingress-NGINX Controller** installed in your cluster
5. **Redis** (automatically deployed via Kubernetes)

### Environment Setup

1. **Configure local hosts file**

   ```
   127.0.0.1 ticketing.dev
   ```

2. **Create JWT Secret**

   ```bash
   kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_jwt_secret_key
   ```

### Starting the Application

Start the development environment using Skaffold:

```bash
skaffold dev
```

This will:

1. Start all services (Auth, Tickets, Orders, Expiration, Client, NATS, Redis)
2. Configure all required connections
3. Set up the ingress controller for routing
4. Register event listeners for cross-service communication
5. Initialize the job queue for order expiration processing

## Conclusion

Version 19 represents a significant architectural enhancement with the addition of the Worker Service pattern through the Expiration service. This pattern enables reliable time-based operations and background processing, which are critical in real-world distributed systems. The use of Bull.js with Redis for job queues demonstrates how to handle delayed processing in a microservices environment, enabling the system to automatically expire and cancel orders that haven't been completed within the defined timeframe.
