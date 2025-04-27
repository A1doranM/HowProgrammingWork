# Mini Microservices Blog Application

This project is a simple blog application built using a microservices architecture with Node.js and React. It serves as a learning example for understanding how microservices communicate and work together to form a complete application.

## Architecture Overview

The application follows an event-driven microservices architecture where each service is responsible for a specific domain and communicates with other services via an event bus. This approach allows each service to be developed, deployed, and scaled independently.

![Microservices Architecture](https://i.imgur.com/WVQzDpq.png)

## Services

### Client (React Application)
- Frontend that interacts with all the other services
- Displays posts and their comments
- Allows users to create posts and add comments

### Posts Service (Port 4000)
- Responsible for creating and storing posts
- Exposes endpoints to create and retrieve posts
- Emits events when a post is created

### Comments Service (Port 4001)
- Manages comments for posts
- Exposes endpoints to create and retrieve comments for a specific post
- Emits events when a comment is created
- Updates comment status based on moderation results

### Query Service (Port 4002)
- Aggregates data from other services
- Maintains a local database of posts and their associated comments
- Provides efficient read operations for the client
- Listens for events to keep its data in sync

### Moderation Service (Port 4003)
- Responsible for moderating comment content
- Checks comments for inappropriate content (in this demo, rejects comments containing the word "orange")
- Emits events with moderation results

### Event Bus (Port 4005)
- Central component that facilitates communication between services
- Receives events from any service and broadcasts them to all other services
- Stores a history of all events for recovery purposes

## Event Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Posts Service
    participant Comments Service
    participant Event Bus
    participant Query Service
    participant Moderation Service

    %% Creating a post
    Client->>Posts Service: Create Post
    Posts Service->>Event Bus: PostCreated Event
    Event Bus->>Query Service: PostCreated Event
    Query Service->>Query Service: Store Post Data

    %% Creating a comment
    Client->>Comments Service: Create Comment
    Comments Service->>Event Bus: CommentCreated Event (status: pending)
    Event Bus->>Query Service: CommentCreated Event
    Query Service->>Query Service: Store Comment with pending status
    Event Bus->>Moderation Service: CommentCreated Event
    
    %% Moderating a comment
