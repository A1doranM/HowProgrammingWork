# Ticketing Application - Back to the Client

A complete microservices-based ticketing platform built with Node.js, TypeScript, React, and Kubernetes, featuring a comprehensive frontend interface that connects to all backend services.

## What's Changed from Version 20 (Handling Payments)

Version 21 builds upon the payment processing system established in version 20, completing the application with a full-featured frontend interface:

### Complete Client Application

- **Next.js-based Frontend**: Implemented server-side rendered React application with proper routing

  ```jsx
  // in client/pages/index.js
  const LandingPage = ({ currentUser, tickets }) => {
    const ticketList = tickets.map((ticket) => {
      return (
        <tr key={ticket.id}>
          <td>{ticket.title}</td>
          <td>{ticket.price}</td>
          <td>
            <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
              View
            </Link>
          </td>
        </tr>
      );
    });

    return (
      <div>
        <h1>Tickets</h1>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>{ticketList}</tbody>
        </table>
      </div>
    );
  };
  ```

- **Authentication UI**: Sign-in and sign-up forms with client-side validation

  ```jsx
  // in client/pages/auth/signin.js
  export default () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequest({
      url: '/api/users/signin',
      method: 'post',
      body: {
        email,
        password
      },
      onSuccess: () => Router.push('/')
    });

    // Form rendering and submission logic
  };
  ```

### Ticket Management Interface

- **Ticket Creation**: Form for creating new tickets with input validation

  ```jsx
  // in client/pages/tickets/new.js
  const NewTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    
    // Price formatting on blur
    const onBlur = () => {
      const value = parseFloat(price);
      if (isNaN(value)) {
        return;
      }
      setPrice(value.toFixed(2));
    };

    // Form rendering and submission logic
  };
  ```

- **Ticket Display**: List view and detail view for available tickets

  ```jsx
  // in client/pages/tickets/[ticketId].js
  const TicketShow = ({ ticket }) => {
    // Purchase request setup
    const { doRequest, errors } = useRequest({
      url: '/api/orders',
      method: 'post',
      body: {
        ticketId: ticket.id,
      },
      onSuccess: (order) =>
        Router.push('/orders/[orderId]', `/orders/${order.id}`),
    });

    return (
      <div>
        <h1>{ticket.title}</h1>
        <h4>Price: {ticket.price}</h4>
        {errors}
        <button onClick={() => doRequest()} className="btn btn-primary">
          Purchase
        </button>
      </div>
    );
  };
  ```

### Order & Payment Flow

- **Order Display**: List view and detail view for user's orders

  ```jsx
  // in client/pages/orders/index.js
  const OrderIndex = ({ orders }) => {
    return (
      <ul>
        {orders.map((order) => {
          return (
            <li key={order.id}>
              {order.ticket.title} - {order.status}
            </li>
          );
        })}
      </ul>
    );
  };
  ```

- **Payment Integration**: Stripe checkout component with expiration timer

  ```jsx
  // in client/pages/orders/[orderId].js
  const OrderShow = ({ order, currentUser }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    
    // Timer logic
    useEffect(() => {
      const findTimeLeft = () => {
        const msLeft = new Date(order.expiresAt) - new Date();
        setTimeLeft(Math.round(msLeft / 1000));
      };

      findTimeLeft();
      const timerId = setInterval(findTimeLeft, 1000);

      return () => {
        clearInterval(timerId);
      };
    }, [order]);

    if (timeLeft < 0) {
      return <div>Order Expired</div>;
    }

    return (
      <div>
        Time left to pay: {timeLeft} seconds
        <StripeCheckout
          token={({ id }) => doRequest({ token: id })}
          stripeKey="pk_test_JMdyKVvf8EGTB0Fl28GsN7YY"
          amount={order.ticket.price * 100}
          email={currentUser.email}
        />
        {errors}
      </div>
    );
  };
  ```

### API Client Architecture

- **Request Management Hook**: Custom hook for handling API requests

  ```jsx
  // in client/hooks/use-request.js
  export default ({ url, method, body, onSuccess }) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async (props = {}) => {
      try {
        setErrors(null);
        const response = await axios[method](url, { ...body, ...props });

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (err) {
        // Error handling logic
      }
    };

    return { doRequest, errors };
  };
  ```

- **Server-side and Client-side Data Fetching**: Next.js getInitialProps for SSR

  ```jsx
  // Example from client/pages/index.js
  LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets');
    return { tickets: data };
  };
  ```

## Complete Application Architecture

The application now implements a full-stack architecture with frontend integration:

```mermaid
graph TD
    subgraph "Client Application"
        ClientApp["Next.js Frontend"]
        Pages["React Pages"]
        Components["React Components"]
        Hooks["Custom Hooks"]
        API["API Client"]
        
        ClientApp --- Pages
        ClientApp --- Components
        Pages --- Hooks
        Pages --- API
    end
    
    subgraph "API Gateway"
        Ingress["Ingress Controller"]
    end
    
    subgraph "Microservices"
        AuthAPI["Auth Service"]
        TicketsAPI["Tickets Service"]
        OrdersAPI["Orders Service"]
        PaymentsAPI["Payments Service"]
        ExpirationService["Expiration Service"]
    end
    
    subgraph "Databases"
        AuthDB[(Auth MongoDB)]
        TicketsDB[(Tickets MongoDB)]
        OrdersDB[(Orders MongoDB)]
        PaymentsDB[(Payments MongoDB)]
    end
    
    subgraph "Message Broker"
        NATS["NATS Streaming"]
    end
    
    subgraph "External Services"
        StripeAPI["Stripe API"]
    end
    
    subgraph "Data Stores"
        Redis[(Redis)]
    end
    
    API -- "HTTP Requests" --> Ingress
    Ingress -- "/api/users/*" --> AuthAPI
    Ingress -- "/api/tickets/*" --> TicketsAPI
    Ingress -- "/api/orders/*" --> OrdersAPI
    Ingress -- "/api/payments/*" --> PaymentsAPI
    
    AuthAPI --- AuthDB
    TicketsAPI --- TicketsDB
    OrdersAPI --- OrdersDB
    PaymentsAPI --- PaymentsDB
    
    TicketsAPI <--> NATS
    OrdersAPI <--> NATS
    PaymentsAPI <--> NATS
    ExpirationService <--> NATS
    
    ExpirationService --- Redis
    PaymentsAPI --- StripeAPI
    
    style ClientApp fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style Pages fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style Components fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style Hooks fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style API fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style Ingress fill:#fb8c00,stroke:#fff,stroke-width:1px,color:#fff
    style AuthAPI fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style TicketsAPI fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style OrdersAPI fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style PaymentsAPI fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style ExpirationService fill:#673ab7,stroke:#fff,stroke-width:1px,color:#fff
    style AuthDB fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style TicketsDB fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style OrdersDB fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style PaymentsDB fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style Redis fill:#e53935,stroke:#fff,stroke-width:1px,color:#fff
    style NATS fill:#43a047,stroke:#fff,stroke-width:1px,color:#fff
    style StripeAPI fill:#673ab7,stroke:#fff,stroke-width:1px,color:#fff
```

## Frontend Component Structure

The client application is organized around Next.js pages and components:

```mermaid
graph TD
    subgraph "Next.js Application"
        App["_app.js"]
        Header["Header Component"]
        
        subgraph "Page Components"
            Home["Landing Page (index.js)"]
            
            subgraph "Auth Pages"
                SignUp["Signup Page"]
                SignIn["Signin Page"]
            end
            
            subgraph "Ticket Pages"
                TicketList["Ticket List (index.js)"]
                TicketNew["New Ticket Form"]
                TicketDetail["Ticket Detail"]
            end
            
            subgraph "Order Pages"
                OrderList["Order List (index.js)"]
                OrderDetail["Order Detail with Payment"]
            end
        end
        
        subgraph "Custom Hooks"
            UseRequest["use-request Hook"]
        end
        
        subgraph "API Client"
            BuildClient["build-client"]
        end
    end
    
    App --- Header
    App --- Home
    App --- SignUp
    App --- SignIn
    App --- TicketList
    App --- TicketNew
    App --- TicketDetail
    App --- OrderList
    App --- OrderDetail
    
    SignUp --- UseRequest
    SignIn --- UseRequest
    TicketNew --- UseRequest
    TicketDetail --- UseRequest
    OrderDetail --- UseRequest
    
    Home --- BuildClient
    SignUp --- BuildClient
    SignIn --- BuildClient
    TicketList --- BuildClient
    TicketNew --- BuildClient
    TicketDetail --- BuildClient
    OrderList --- BuildClient
    OrderDetail --- BuildClient
    
    style App fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style Header fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style Home fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style SignUp fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style SignIn fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style TicketList fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style TicketNew fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style TicketDetail fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style OrderList fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style OrderDetail fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style UseRequest fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style BuildClient fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
```

## User Flow Diagrams

### Ticket Purchase Flow

The complete user flow for purchasing a ticket:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant TicketsAPI
    participant OrdersAPI
    participant NATS
    participant ExpirationService
    participant PaymentsAPI
    participant Stripe
    
    User->>Frontend: Browse tickets
    Frontend->>TicketsAPI: Get available tickets
    TicketsAPI-->>Frontend: Ticket list
    Frontend-->>User: Display tickets
    
    User->>Frontend: Select ticket
    Frontend->>TicketsAPI: Get ticket details
    TicketsAPI-->>Frontend: Ticket information
    Frontend-->>User: Display ticket details
    
    User->>Frontend: Click "Purchase"
    Frontend->>OrdersAPI: Create order
    OrdersAPI->>OrdersAPI: Reserve ticket
    OrdersAPI->>NATS: Publish OrderCreatedEvent
    OrdersAPI-->>Frontend: Order details
    Frontend->>Frontend: Redirect to order page
    
    NATS->>ExpirationService: OrderCreatedEvent
    ExpirationService->>ExpirationService: Set expiration timer
    
    Frontend-->>User: Display order with payment form
    Frontend->>Frontend: Start countdown timer
    
    User->>Frontend: Enter payment details
    Frontend->>PaymentsAPI: Process payment
    PaymentsAPI->>Stripe: Create charge
    Stripe-->>PaymentsAPI: Confirm payment
    PaymentsAPI->>NATS: Publish PaymentCreatedEvent
    PaymentsAPI-->>Frontend: Payment confirmation
    
    Frontend-->>User: Display success message
    Frontend->>Frontend: Redirect to orders page
```

### Authentication Flow

The authentication flow implemented in the frontend:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthAPI
    
    User->>Frontend: Visit sign-up page
    Frontend-->>User: Display signup form
    User->>Frontend: Enter credentials
    Frontend->>AuthAPI: Submit credentials
    AuthAPI->>AuthAPI: Validate credentials
    AuthAPI->>AuthAPI: Hash password
    AuthAPI->>AuthAPI: Create JWT
    AuthAPI->>AuthAPI: Set cookie
    AuthAPI-->>Frontend: Success response + cookie
    Frontend->>Frontend: Store cookie
    Frontend->>Frontend: Redirect to landing page
    
    User->>Frontend: Visit protected page
    Frontend->>AuthAPI: Validate current user
    AuthAPI->>AuthAPI: Verify JWT from cookie
    AuthAPI-->>Frontend: User information
    Frontend-->>User: Display protected content
```

## Client-Server Communication

The client application communicates with backend services through the API client:

```mermaid
graph TD
    subgraph "Client-side"
        A[React Component]
        B[use-request Hook]
        C[Axios Client]
        
        A --> B
        B --> C
    end
    
    subgraph "Server-side"
        D[build-client]
        E[getInitialProps]
        
        E --> D
    end
    
    subgraph "Network"
        F[HTTP Request]
        G[Cookie-based Auth]
    end
    
    C --> F
    D --> F
    F --> G
    
    subgraph "Backend"
        H[Ingress Controller]
        I[Microservices]
        
        G --> H
        H --> I
    end
    
    style A fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style B fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style C fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style D fill:#673ab7,stroke:#fff,stroke-width:1px,color:#fff
    style E fill:#673ab7,stroke:#fff,stroke-width:1px,color:#fff
    style F fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style G fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style H fill:#fb8c00,stroke:#fff,stroke-width:1px,color:#fff
    style I fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
```

## Next.js Data Fetching Patterns

The application uses Next.js data fetching for server-side rendering:

```mermaid
flowchart TD
    A[Browser Request] --> B[Next.js Server]
    B --> C{Component getInitialProps}
    
    C -->|Yes| D[Execute getInitialProps]
    C -->|No| E[Skip data fetching]
    
    D --> F[build-client]
    F --> G[API Request]
    G --> H[Microservices]
    H --> I[Return Data]
    I --> J[Render React Component]
    
    E --> J
    
    J --> K[Send HTML to Browser]
    K --> L[Hydrate React App]
    
    style A fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
    style B fill:#673ab7,stroke:#fff,stroke-width:1px,color:#fff
    style C fill:#ff9800,stroke:#fff,stroke-width:1px,color:#fff
    style D fill:#673ab7,stroke:#fff,stroke-width:1px,color:#fff
    style E fill:#673ab7,stroke:#fff,stroke-width:1px,color:#fff
    style F fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style G fill:#00acc1,stroke:#fff,stroke-width:1px,color:#fff
    style H fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style I fill:#1e88e5,stroke:#fff,stroke-width:1px,color:#fff
    style J fill:#673ab7,stroke:#fff,stroke-width:1px,color:#fff
    style K fill:#673ab7,stroke:#fff,stroke-width:1px,color:#fff
    style L fill:#8e24aa,stroke:#fff,stroke-width:1px,color:#fff
```

## Key Client-side Implementation Details

### Error Handling Pattern

```jsx
// In use-request.js
try {
  setErrors(null);
  const response = await axios[method](url, { ...body, ...props });
  
  if (onSuccess) {
    onSuccess(response.data);
  }
  
  return response.data;
} catch (err) {
  setErrors(
    <div className="alert alert-danger">
      <h4>Ooops....</h4>
      <ul className="my-0">
        {err.response.data.errors.map((err) => (
          <li key={err.message}>{err.message}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Countdown Timer Implementation

```jsx
// In orders/[orderId].js
useEffect(() => {
  const findTimeLeft = () => {
    const msLeft = new Date(order.expiresAt) - new Date();
    setTimeLeft(Math.round(msLeft / 1000));
  };

  findTimeLeft();
  const timerId = setInterval(findTimeLeft, 1000);

  return () => {
    clearInterval(timerId);
  };
}, [order]);
```

### Form Validation

```jsx
// In tickets/new.js
const onBlur = () => {
  const value = parseFloat(price);

  if (isNaN(value)) {
    return;
  }

  setPrice(value.toFixed(2));
};
```

### Client-side Navigation

```jsx
// Example from orders/[orderId].js
const { doRequest, errors } = useRequest({
  url: '/api/payments',
  method: 'post',
  body: {
    orderId: order.id,
  },
  onSuccess: () => Router.push('/orders'),
});
```

## Running the Application

### Prerequisites

1. **Docker Desktop** with Kubernetes enabled
2. **kubectl** command-line tool
3. **Skaffold** for development workflow
4. **Ingress-NGINX Controller** installed in your cluster
5. **Redis** (automatically deployed via Kubernetes)
6. **Stripe Account** with API keys

### Environment Setup

1. **Configure local hosts file**

   ```
   127.0.0.1 ticketing.dev
   ```

2. **Create Secrets**

   ```bash
   kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_jwt_secret_key
   kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=your_stripe_secret_key
   ```

### Starting the Application

Start the development environment using Skaffold:

```bash
skaffold dev
```

This will:

1. Start all services (Auth, Tickets, Orders, Expiration, Payments, Client, NATS, Redis)
2. Configure all required connections
3. Set up the ingress controller for routing
4. Register event listeners for cross-service communication
5. Start the Next.js frontend application

### Accessing the Application

Access the application at:

```
https://ticketing.dev
```

## Conclusion

Version 21 completes the ticketing application by implementing the full frontend interface, creating a comprehensive full-stack application with microservices architecture. The Next.js client application provides a user-friendly interface for ticket browsing, purchasing, and payment processing, all integrated with the backend services developed in previous versions. This architecture demonstrates a modern approach to building scalable, maintainable web applications with clear separation of concerns between frontend and backend components.
