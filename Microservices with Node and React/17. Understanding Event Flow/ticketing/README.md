# Ticketing Application - Understanding Event Flow

A microservices-based ticketing platform built with Node.js, TypeScript, and Kubernetes, now featuring a complete event publishing implementation for inter-service communication.

## What's Changed from Version 16 (Cross-Service Data Replication In Action)

Version 17 builds upon the cross-service data replication foundation established in version 16, focusing on implementing a complete event publishing mechanism:

### Event Publishing Implementation

- **Order Creation Event Publishing**: Orders service now publishes events when orders are created

  ```typescript
  // in orders/src/routes/new.ts
  // Publish an event saying that an order was created
  new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    status: order.status,
    userId: order.userId,
    expiresAt: order.expiresAt.toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  });
  ```

- **Order Cancellation Event Publishing**: Orders service now publishes events when orders are cancelled

  ```typescript
  // in orders/src/routes/delete.ts
  // publishing an event saying this was cancelled!
  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    ticket: {
      id: order.ticket.id,
    },
  });
  ```

- **Ticket Update Event Publishing**: Tickets service now publishes events when tickets are updated

  ```typescript
  // in tickets/src/routes/update.ts
  new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId,
  });
  ```

### New Event Types in Common Library

- **Order-Related Event Interfaces**: Added interfaces for order events

  ```typescript
  // in common/src/events/order-created-event.ts
  export interface OrderCreatedEvent {
    subject: Subjects.OrderCreated;
    data: {
      id: string;
      status: OrderStatus;
      userId: string;
      expiresAt: string;
      ticket: {
        id: string;
        price: number;
      };
    };
  }

  // in common/src/events/order-cancelled-event.ts
  export interface OrderCancelledEvent {
    subject: Subjects.OrderCancelled;
    data: {
      id: string;
      ticket: {
        id: string;
      };
    };
  }
  ```

- **Enhanced Subjects Enum**: Added new event types to the Subjects enum

  ```typescript
  // in common/src/events/subjects.ts
  export enum Subjects {
    TicketCreated = 'ticket:created',
    TicketUpdated = 'ticket:updated',
    OrderCreated = 'order:created',
    OrderCancelled = 'order:cancelled',
  }
  ```

- **Order Publishers**: Created publisher classes for order events

  ```typescript
  // in orders/src/events/publishers/order-created-publisher.ts
  export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
  }

  // in orders/src/events/publishers/order-cancelled-publisher.ts
  export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  }
  ```

## Architecture Overview

The application has evolved to implement event publishing for inter-service communication:

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
        
        TicketsAPI --- TicketsDB
        TicketsAPI -- "Publish Events" --> TicketPublishers
    end
    
    subgraph "Orders Service"
        OrdersAPI["Orders API"]
        OrdersDB[(Orders MongoDB)]
        ReplicatedTickets["Replicated Tickets"]
        OrderPublishers["Order Publishers"]
        
        OrdersAPI --- OrdersDB
        OrdersAPI --- ReplicatedTickets
        OrdersAPI -- "Publish Events" --> OrderPublishers
        ReplicatedTickets -.- OrdersDB
    end
    
    subgraph "Message Broker"
        NATS["NATS Streaming"]
    end
    
    ClientApp -- "HTTP Requests" --> Ingress
    Ingress -- "/api/users/*" --> AuthAPI
    Ingress -- "/api/tickets/*" --> TicketsAPI
    Ingress -- "/api/orders/*" --> OrdersAPI
    
    TicketPublishers -- "Publish Events" --> NATS
    OrderPublishers -- "Publish Events" --> NATS
    
    style ClientApp fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style Ingress fill:#fb8c00,stroke:#fff,stroke-width:1px,color:#fff
    style AuthAPI fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style TicketsAPI fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style OrdersAPI fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style AuthDB fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style TicketsDB fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style OrdersDB fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style NATS fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style TicketPublishers fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style OrderPublishers fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style ReplicatedTickets fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
```

### Components Explained

- **Client Application**: Next.js frontend for user interactions
- **Ingress Controller**: Routes API requests to appropriate services
- **Auth Service**: Handles user authentication and authorization
- **Tickets Service**: Manages ticket creation and updates, now with event publishing
- **Orders Service**: Manages order creation, viewing, and cancellation, now with event publishing
- **NATS Streaming**: Message broker for event-based communication
- **Ticket Publishers**: Components that publish ticket-related events
- **Order Publishers**: Components that publish order-related events
- **Replicated Tickets**: Copy of ticket data in the Orders service

## Event Flow Implementation

In version 17, we have implemented a one-directional event flow where services publish events but do not yet consume them:

```mermaid
sequenceDiagram
    participant Client
    participant TicketsAPI
    participant OrdersAPI
    participant NATS
    
    Client->>TicketsAPI: Update Ticket
    TicketsAPI->>TicketsAPI: Save to DB
    TicketsAPI->>NATS: Publish TicketUpdatedEvent
    
    Client->>OrdersAPI: Create Order
    OrdersAPI->>OrdersAPI: Save Order to DB
    OrdersAPI->>NATS: Publish OrderCreatedEvent
    
    Client->>OrdersAPI: Cancel Order
    OrdersAPI->>OrdersAPI: Update Order Status
    OrdersAPI->>NATS: Publish OrderCancelledEvent
    
    Note over NATS: Events are published<br>but not yet consumed
```

### Event Publishing Process

For each service that publishes events, the process follows this pattern:

```mermaid
flowchart TD
    A[Route Handler] --> B[Process Request]
    B --> C[Save to Database]
    C --> D[Create Publisher Instance]
    D --> E[Format Event Data]
    E --> F[Publish Event to NATS]
    F --> G[Return Response to Client]
    
    style A fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style B fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style C fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style D fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style E fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style F fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style G fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
```

### Event Types and Data Flow

```mermaid
classDiagram
    class Subjects {
        <<enumeration>>
        TicketCreated
        TicketUpdated
        OrderCreated
        OrderCancelled
    }
    
    class Event {
        <<interface>>
        subject: Subjects
        data: any
    }
    
    class OrderCreatedEvent {
        <<interface>>
        subject: Subjects.OrderCreated
        data: OrderCreatedData
    }
    
    class OrderCancelledEvent {
        <<interface>>
        subject: Subjects.OrderCancelled
        data: OrderCancelledData
    }
    
    class TicketUpdatedEvent {
        <<interface>>
        subject: Subjects.TicketUpdated
        data: TicketUpdatedData
    }
    
    class Publisher {
        <<abstract>>
        subject: Subjects
        client: Stan
        publish(data): Promise~void~
    }
    
    class OrderCreatedPublisher {
        subject: Subjects.OrderCreated
    }
    
    class OrderCancelledPublisher {
        subject: Subjects.OrderCancelled
    }
    
    class TicketUpdatedPublisher {
        subject: Subjects.TicketUpdated
    }
    
    Event <|-- OrderCreatedEvent
    Event <|-- OrderCancelledEvent
    Event <|-- TicketUpdatedEvent
    
    Publisher <|-- OrderCreatedPublisher
    Publisher <|-- OrderCancelledPublisher
    Publisher <|-- TicketUpdatedPublisher
    
    OrderCreatedPublisher ..> OrderCreatedEvent : publishes
    OrderCancelledPublisher ..> OrderCancelledEvent : publishes
    TicketUpdatedPublisher ..> TicketUpdatedEvent : publishes
```

## Frontend and Backend Integration

The frontend client interacts with the backend services through the Ingress controller:

```mermaid
flowchart TD
    subgraph Client["Next.js Client Application"]
        A[Landing Page]
        B[Auth Pages]
        C[Tickets Pages]
        D[Orders Pages]
        E[API Client]
        
        A --- E
        B --- E
        C --- E
        D --- E
    end
    
    subgraph Kubernetes["Kubernetes Cluster"]
        F[Ingress Controller]
        
        subgraph Services["Microservices"]
            G[Auth Service]
            H[Tickets Service]
            I[Orders Service]
        end
        
        subgraph Databases["MongoDB Instances"]
            J[(Auth DB)]
            K[(Tickets DB)]
            L[(Orders DB)]
        end
        
        subgraph MessageBroker["Event Bus"]
            M[NATS Streaming]
        end
        
        F --> G
        F --> H
        F --> I
        
        G --> J
        H --> K
        I --> L
        
        H -- "Publish" --> M
        I -- "Publish" --> M
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
    style J fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style K fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style L fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style M fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
```

### API Routes and Service Interactions

```mermaid
flowchart LR
    subgraph Client["Client App"]
        A["Next.js Pages"]
    end
    
    subgraph Ingress["Ingress Controller"]
        B["/api/users/*"]
        C["/api/tickets/*"]
        D["/api/orders/*"]
    end
    
    subgraph AuthService["Auth Service"]
        E["/api/users/signup"]
        F["/api/users/signin"]
        G["/api/users/signout"]
        H["/api/users/currentuser"]
    end
    
    subgraph TicketsService["Tickets Service"]
        I["/api/tickets (GET)"]
        J["/api/tickets (POST)"]
        K["/api/tickets/:id (GET)"]
        L["/api/tickets/:id (PUT)"]
    end
    
    subgraph OrdersService["Orders Service"]
        M["/api/orders (GET)"]
        N["/api/orders (POST)"]
        O["/api/orders/:id (GET)"]
        P["/api/orders/:id (DELETE)"]
    end
    
    A --> B & C & D
    
    B --> E & F & G & H
    C --> I & J & K & L
    D --> M & N & O & P
    
    style A fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style B fill:#fb8c00,stroke:#fff,stroke-width:1px,color:#fff
    style C fill:#fb8c00,stroke:#fff,stroke-width:1px,color:#fff
    style D fill:#fb8c00,stroke:#fff,stroke-width:1px,color:#fff
    style E fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style F fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style G fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style H fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style I fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style J fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style K fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style L fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style M fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style N fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style O fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style P fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
```

## Order Creation and Event Publishing Flow

The order creation process now includes event publishing:

```mermaid
sequenceDiagram
    participant Client
    participant Ingress
    participant OrdersAPI
    participant OrdersDB
    participant NATS
    
    Client->>Ingress: POST /api/orders
    Ingress->>OrdersAPI: Route Request
    
    OrdersAPI->>OrdersAPI: Validate Request
    OrdersAPI->>OrdersAPI: Find Ticket & Check Reservation
    
    alt Ticket Not Found or Already Reserved
        OrdersAPI-->>Client: Error Response
    else Ticket Available
        OrdersAPI->>OrdersAPI: Calculate Expiration
        OrdersAPI->>OrdersDB: Save New Order
        OrdersDB-->>OrdersAPI: Confirmation
        
        OrdersAPI->>OrdersAPI: Format Event Data
        OrdersAPI->>NATS: Publish OrderCreatedEvent
        NATS-->>OrdersAPI: Acknowledgement
        
        OrdersAPI-->>Client: 201 Created with Order
    end
```

## Kubernetes Deployment Architecture

The application is deployed in Kubernetes with multiple services and databases:

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Deployments"
            AuthDepl["auth-depl"]
            TicketsDepl["tickets-depl"]
            OrdersDepl["orders-depl"]
            ClientDepl["client-depl"]
            NatsDepl["nats-depl"]
        end
        
        subgraph "Databases"
            AuthMongo["auth-mongo-depl"]
            TicketsMongo["tickets-mongo-depl"]
            OrdersMongo["orders-mongo-depl"]
        end
        
        subgraph "Services"
            AuthSrv["auth-srv"]
            TicketsSrv["tickets-srv"]
            OrdersSrv["orders-srv"]
            ClientSrv["client-srv"]
            NatsSrv["nats-srv"]
        end
        
        Ingress["ingress-service"]
    end
    
    External["External Traffic"]
    
    AuthDepl --- AuthSrv
    TicketsDepl --- TicketsSrv
    OrdersDepl --- OrdersSrv
    ClientDepl --- ClientSrv
    NatsDepl --- NatsSrv
    
    AuthDepl --- AuthMongo
    TicketsDepl --- TicketsMongo
    OrdersDepl --- OrdersMongo
    
    TicketsDepl -- "Publish Events" --> NatsSrv
    OrdersDepl -- "Publish Events" --> NatsSrv
    
    Ingress --- AuthSrv
    Ingress --- TicketsSrv
    Ingress --- OrdersSrv
    Ingress --- ClientSrv
    
    External --- Ingress
    
    style AuthDepl fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style TicketsDepl fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style OrdersDepl fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style ClientDepl fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style NatsDepl fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style AuthMongo fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style TicketsMongo fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style OrdersMongo fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style AuthSrv fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style TicketsSrv fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style OrdersSrv fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style ClientSrv fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style NatsSrv fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style Ingress fill:#fb8c00,stroke:#fff,stroke-width:1px,color:#fff
    style External fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
```

## Implementation Details

### Publisher Implementation

The publisher classes follow a type-safe pattern using generic types:

```typescript
// Base Publisher in common library
export abstract class Publisher<T extends Event> {
  abstract subject: T['subject'];
  protected client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log('Event published to subject', this.subject);
        resolve();
      });
    });
  }
}

// Concrete publisher implementation
export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
```

### Route Handler Integration

Route handlers now integrate with publishers:

```typescript
// Example from orders/src/routes/new.ts
// After saving order to the database
new OrderCreatedPublisher(natsWrapper.client).publish({
  id: order.id,
  status: order.status,
  userId: order.userId,
  expiresAt: order.expiresAt.toISOString(),
  ticket: {
    id: ticket.id,
    price: ticket.price,
  },
});
```

### NATS Connection Setup

Both services connect to NATS on startup:

```typescript
// In both orders/src/index.ts and tickets/src/index.ts
await natsWrapper.connect(
  process.env.NATS_CLUSTER_ID,
  process.env.NATS_CLIENT_ID,
  process.env.NATS_URL
);
natsWrapper.client.on('close', () => {
  console.log('NATS connection closed!');
  process.exit();
});
process.on('SIGINT', () => natsWrapper.client.close());
process.on('SIGTERM', () => natsWrapper.client.close());
```

## Running the Application

### Prerequisites

1. **Docker Desktop** with Kubernetes enabled
2. **kubectl** command-line tool
3. **Skaffold** for development workflow
4. **Ingress-NGINX Controller** installed in your cluster

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

1. Start all services (Auth, Tickets, Orders, Client, NATS)
2. Configure all required connections
3. Set up the ingress controller for routing
4. Connect services to NATS for event publishing

## Conclusion

Version 17 represents a significant step in the evolution of the ticketing application by implementing event publishing between services. This forms the foundation for a robust event-driven architecture, allowing for loose coupling and better scalability. Future versions will build upon this foundation by implementing event listeners to complete the event flow.
