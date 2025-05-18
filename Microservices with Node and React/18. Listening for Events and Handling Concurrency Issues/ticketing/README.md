# Ticketing Application - Listening for Events and Handling Concurrency Issues

A microservices-based ticketing platform built with Node.js, TypeScript, and Kubernetes, featuring a complete event-driven architecture with bi-directional event flow and concurrency management.

## What's Changed from Version 17 (Understanding Event Flow)

Version 18 builds upon the event publishing foundation established in version 17, completing the event-driven architecture with event listening and concurrency control:

### Event Listener Implementation

- **Ticket Event Listeners in Orders Service**: Orders service now listens for ticket-related events

  ```typescript
  // in orders/src/events/listeners/ticket-created-listener.ts
  export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
      const { id, title, price } = data;

      const ticket = Ticket.build({
        id,
        title,
        price,
      });
      await ticket.save();

      msg.ack();
    }
  }
  ```

- **Order Event Listeners in Tickets Service**: Tickets service now listens for order-related events

  ```typescript
  // in tickets/src/events/listeners/order-created-listener.ts
  export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
      // Find the ticket that the order is reserving
      const ticket = await Ticket.findById(data.ticket.id);

      // If no ticket, throw error
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Mark the ticket as being reserved by setting its orderId property
      ticket.set({ orderId: data.id });

      // Save the ticket
      await ticket.save();
      await new TicketUpdatedPublisher(this.client).publish({
        id: ticket.id,
        price: ticket.price,
        title: ticket.title,
        userId: ticket.userId,
        orderId: ticket.orderId,
        version: ticket.version,
      });

      // ack the message
      msg.ack();
    }
  }
  ```

### Concurrency Management

- **Versioning with mongoose-update-if-current**: Added versioning to models for optimistic concurrency control

  ```typescript
  // in tickets/src/models/ticket.ts
  import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
  
  interface TicketDoc extends mongoose.Document {
    // ...
    version: number;
    // ...
  }
  
  ticketSchema.set('versionKey', 'version');
  ticketSchema.plugin(updateIfCurrentPlugin);
  ```

- **Version-Based Event Processing**: Added methods to find documents by event with version checking

  ```typescript
  // in orders/src/models/ticket.ts
  interface TicketModel extends mongoose.Model<TicketDoc> {
    // ...
    findByEvent(event: {
      id: string;
      version: number;
    }): Promise<TicketDoc | null>;
  }
  
  ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
    return Ticket.findOne({
      _id: event.id,
      version: event.version - 1,
    });
  };
  ```

### Ticket Reservation System

- **Order ID Tracking in Tickets**: Tickets now track which order has reserved them

  ```typescript
  // in tickets/src/models/ticket.ts
  interface TicketDoc extends mongoose.Document {
    // ...
    orderId?: string;
  }
  
  const ticketSchema = new mongoose.Schema(
    {
      // ...
      orderId: {
        type: String,
      },
    },
    // ...
  );
  ```

- **Reservation Logic**: Order creation and cancellation now update ticket reservation status

  ```typescript
  // In order-created-listener.ts
  ticket.set({ orderId: data.id });
  
  // In order-cancelled-listener.ts
  ticket.set({ orderId: undefined });
  ```

### Enhanced Event Types

- **Updated TicketUpdatedEvent Interface**: Now includes orderId field for reservation tracking

  ```typescript
  // in common/src/events/ticket-updated-event.ts
  export interface TicketUpdatedEvent {
    subject: Subjects.TicketUpdated;
    data: {
      id: string;
      version: number;
      title: string;
      price: number;
      userId: string;
      orderId?: string;
    };
  }
  ```

### Event Listener Registration

- **Listener Initialization on Service Startup**: Services now initialize listeners during startup

  ```typescript
  // in orders/src/index.ts
  new TicketCreatedListener(natsWrapper.client).listen();
  new TicketUpdatedListener(natsWrapper.client).listen();
  ```

## Architecture Overview

The application has evolved to implement a complete event-driven architecture with bi-directional event flow between services:

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
        
        OrdersAPI --- OrdersDB
        OrdersAPI --- ReplicatedTickets
        OrdersAPI --> OrderPublishers
        OrderListeners --> OrdersAPI
        OrderListeners --> ReplicatedTickets
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
    
    NATS -- "Ticket Events" --> OrderListeners
    NATS -- "Order Events" --> TicketListeners
    
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
    style TicketListeners fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style OrderListeners fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
```

### Components Explained

- **Client Application**: Next.js frontend for user interactions
- **Ingress Controller**: Routes API requests to appropriate services
- **Auth Service**: Handles user authentication and authorization
- **Tickets Service**:
  - Manages ticket creation and updates
  - Publishes events when tickets change
  - Listens for order events to track ticket reservations
- **Orders Service**:
  - Manages order creation and cancellation
  - Maintains replicated ticket data
  - Publishes events when orders change
  - Listens for ticket events to update local ticket data
- **NATS Streaming**: Message broker enabling asynchronous communication between services

## Bi-Directional Event Flow

Version 18 implements a complete bi-directional event flow between services:

```mermaid
sequenceDiagram
    participant Client
    participant TicketsService
    participant NATS
    participant OrdersService
    
    %% Ticket Creation Flow
    Client->>TicketsService: Create Ticket
    TicketsService->>TicketsService: Save to DB
    TicketsService->>NATS: Publish TicketCreatedEvent
    NATS->>OrdersService: Deliver TicketCreatedEvent
    OrdersService->>OrdersService: Save Ticket Copy
    
    %% Order Creation Flow
    Client->>OrdersService: Create Order
    OrdersService->>OrdersService: Save Order to DB
    OrdersService->>NATS: Publish OrderCreatedEvent
    NATS->>TicketsService: Deliver OrderCreatedEvent
    TicketsService->>TicketsService: Mark Ticket Reserved
    TicketsService->>NATS: Publish TicketUpdatedEvent
    NATS->>OrdersService: Deliver TicketUpdatedEvent
    OrdersService->>OrdersService: Update Ticket Copy
    
    %% Order Cancellation Flow
    Client->>OrdersService: Cancel Order
    OrdersService->>OrdersService: Update Order Status
    OrdersService->>NATS: Publish OrderCancelledEvent
    NATS->>TicketsService: Deliver OrderCancelledEvent
    TicketsService->>TicketsService: Remove Reservation
    TicketsService->>NATS: Publish TicketUpdatedEvent
    NATS->>OrdersService: Deliver TicketUpdatedEvent
    OrdersService->>OrdersService: Update Ticket Copy
```

This bi-directional flow ensures that all services have consistent data while remaining loosely coupled. Each service maintains its own database and domain logic, communicating only through events.

## Concurrency Management

Version 18 implements optimistic concurrency control to handle concurrent updates and ensure events are processed in the correct order:

### Versioning with Mongoose

```mermaid
graph TD
    A[Document Version N] --> B[Update Document]
    B --> C[Increment Version to N+1]
    C --> D[New Document Version N+1]
    D --> E[Publish Event with Version N+1]
    E --> F[Other Services Process Event]
```

### Version-Based Event Processing

```mermaid
flowchart TD
    A[Receive Event with Version N] --> B{Find Document with Version N-1}
    B -->|Found| C[Process Event]
    B -->|Not Found| D[Document Not Found or Wrong Version]
    C --> E[Update Document to Version N]
    C --> F[Acknowledge Event]
    D --> G[Reject Event/Retry Logic]
    
    style A fill:#4CAF50,stroke:#fff,stroke-width:1px,color:#fff
    style B fill:#FFC107,stroke:#fff,stroke-width:1px,color:#fff
    style C fill:#2196F3,stroke:#fff,stroke-width:1px,color:#fff
    style D fill:#F44336,stroke:#fff,stroke-width:1px,color:#fff
    style E fill:#2196F3,stroke:#fff,stroke-width:1px,color:#fff
    style F fill:#4CAF50,stroke:#fff,stroke-width:1px,color:#fff
    style G fill:#F44336,stroke:#fff,stroke-width:1px,color:#fff
```

### Event Processing Sequence with Versioning

```mermaid
sequenceDiagram
    participant Ticket as Ticket Document
    participant Publisher as TicketsService
    participant NATS
    participant Listener as OrdersService
    
    Note over Ticket: Version: 1
    
    Publisher->>Ticket: Update Ticket
    Ticket->>Ticket: Increment Version to 2
    Publisher->>NATS: Publish Event with Version 2
    NATS-->>Listener: Deliver Event
    
    Note over Listener: Find Ticket with Version 1
    Listener->>Listener: Update Local Ticket
    Listener->>Listener: Set Version to 2
    
    Publisher->>Ticket: Update Ticket Again
    Ticket->>Ticket: Increment Version to 3
    Publisher->>NATS: Publish Event with Version 3
    
    Note over Listener,NATS: Event with Version 4 arrives first (out of order)
    NATS-->>Listener: Deliver Event with Version 4
    Listener->>Listener: Find Ticket with Version 3 (fails)
    Listener-->>NATS: Can't process yet (version mismatch)
    
    NATS-->>Listener: Deliver Event with Version 3
    Listener->>Listener: Find Ticket with Version 2
    Listener->>Listener: Update Local Ticket
    Listener->>Listener: Set Version to 3
    
    NATS-->>Listener: Redeliver Event with Version 4
    Listener->>Listener: Find Ticket with Version 3
    Listener->>Listener: Update Local Ticket
    Listener->>Listener: Set Version to 4
```

This approach ensures that events are processed in the correct order, even if they arrive out of order, which is crucial in distributed systems.

## Order Creation with Event Flow

The order creation process now involves multiple services and event exchanges:

```mermaid
sequenceDiagram
    participant Client
    participant OrdersAPI
    participant OrdersDB
    participant NATS
    participant TicketsAPI
    participant TicketsDB
    
    Client->>OrdersAPI: POST /api/orders
    OrdersAPI->>OrdersAPI: Validate Request
    OrdersAPI->>OrdersAPI: Check Ticket in Local DB
    
    alt Ticket Not Available
        OrdersAPI-->>Client: Error Response
    else Ticket Available
        OrdersAPI->>OrdersAPI: Calculate Expiration
        OrdersAPI->>OrdersDB: Save Order
        OrdersAPI->>NATS: Publish OrderCreatedEvent
        NATS->>TicketsAPI: Deliver OrderCreatedEvent
        
        TicketsAPI->>TicketsDB: Find Ticket by ID
        TicketsAPI->>TicketsDB: Mark Ticket with orderId
        TicketsAPI->>NATS: Publish TicketUpdatedEvent
        NATS->>OrdersAPI: Deliver TicketUpdatedEvent
        
        OrdersAPI->>OrdersDB: Update Local Ticket Copy
        OrdersAPI-->>Client: 201 Created with Order
    end
```

## Ticket Model with Reservation

The Ticket model in the Tickets service now includes reservation tracking:

```mermaid
classDiagram
    class TicketDoc {
        +string title
        +number price
        +string userId
        +number version
        +string? orderId
    }
    
    class TicketModel {
        +build(attrs: TicketAttrs): TicketDoc
    }
    
    class OrderDoc {
        +string userId
        +OrderStatus status
        +Date expiresAt
        +TicketDoc ticket
    }
    
    class OrderStatus {
        <<enumeration>>
        +Created
        +Cancelled
        +AwaitingPayment
        +Complete
    }
    
    TicketDoc --|> TicketModel : implements
    OrderDoc --> TicketDoc : references
    OrderDoc --> OrderStatus : uses
```

## Frontend and Backend Integration

The complete system with frontend integration and event flows:

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
        
        subgraph EventBus["Event Bus"]
            M[NATS Streaming]
        end
        
        F --> G
        F --> H
        F --> I
        
        G --> J
        H --> K
        I --> L
        
        H <--> M
        I <--> M
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

## Implementation Details

### Listener Base Class

The common library provides a base Listener class:

```typescript
// Base Listener in common library
export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  abstract onMessage(data: T['data'], msg: Message): void;
  protected client: Stan;
  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on('message', (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}
```

### Ticket Model with Versioning

```typescript
// in tickets/src/models/ticket.ts
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Configure versioning
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

// Factory method
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
```

### Ticket Updated Event with Order ID

```typescript
// in common/src/events/ticket-updated-event.ts
export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    userId: string;
    orderId?: string;
  };
}
```

### Version-Based Event Processing

```typescript
// in orders/src/models/ticket.ts
interface TicketModel extends mongoose.Model<TicketDoc> {
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};
```

### Listener Implementation

```typescript
// in orders/src/events/listeners/ticket-updated-listener.ts
export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
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
4. Register event listeners for cross-service communication

## Conclusion

Version 18 represents a significant evolution of the ticketing application by implementing a complete event-driven architecture with bi-directional event flow and robust concurrency control. The addition of event listeners and versioning mechanisms ensures data consistency across services while maintaining loose coupling. This architecture provides a solid foundation for building scalable, resilient microservices systems.
