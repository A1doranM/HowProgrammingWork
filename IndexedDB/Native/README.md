# IndexedDB Native Implementation

## Overview

This is a **Native IndexedDB** example that demonstrates how to use the browser's built-in IndexedDB API directly, without any abstraction layers, libraries, or wrappers. This implementation showcases the fundamental, low-level operations of IndexedDB using pure JavaScript and event-based callbacks.

## Purpose and Features

### What This Example Demonstrates

1. **Direct Browser API Usage**: Pure, native IndexedDB API calls without any libraries or frameworks
2. **Database Lifecycle Management**: Opening databases, handling version changes, and schema creation
3. **Object Store Operations**: Creating and managing object stores (similar to database tables)
4. **Transaction Management**: Understanding and implementing readonly and readwrite transactions
5. **CRUD Operations**: Complete Create, Read, Update, Delete functionality
6. **Cursor-Based Iteration**: Advanced querying using cursors to filter and iterate through records
7. **Event-Driven Architecture**: Working with IndexedDB's callback-based event model

### Key Features Implemented

- ✅ **Add User**: Create new user records with auto-incrementing IDs
- ✅ **Get All Users**: Retrieve all records from the database
- ✅ **Update User**: Modify existing records
- ✅ **Delete User**: Remove records by ID
- ✅ **Find Adults**: Filter records using cursor iteration (users aged 18+)
- ✅ **Visual Logger**: Real-time output display for all database operations

## Architecture Overview

The implementation follows a minimal architecture with clear separation:

```
Native/
├── package.json         # ES Module configuration
├── static/
│   ├── index.html       # UI structure with operation buttons
│   ├── application.js   # Core IndexedDB logic and event handlers
│   ├── styles.css       # Visual styling
│   └── 404.html         # Error page
└── README.md           # This documentation
```

## How the Files Work Together

### 1. [`index.html`](static/index.html)

**Role**: User Interface Layer
- Provides the HTML structure for the application
- Defines control buttons for each database operation
- Contains output display area (`<pre id="output">`)
- Loads the application JavaScript module

**Key Elements**:
- `#add`: Triggers user creation
- `#get`: Retrieves all users
- `#update`: Updates user with ID=1
- `#delete`: Deletes user with ID=2
- `#adults`: Filters users aged 18 and above
- `#output`: Console-like display for operation results

### 2. [`application.js`](static/application.js)

**Role**: Core Business Logic and Database Management

This file implements the complete IndexedDB workflow:

#### **Logger Class** (Lines 1-17)
- Handles output display in the UI
- Serializes objects to JSON for readable output
- Auto-scrolls to show latest operations

#### **Database Initialization** (Lines 21-31)
- Opens or creates the "Example" database (version 1)
- Uses `onupgradeneeded` event to handle schema creation
- Creates "user" object store with auto-incrementing ID
- Returns a Promise-wrapped database instance

#### **Add Operation** (Lines 33-42)
- Creates readwrite transaction
- Prompts user for name and age
- Inserts new record using `add()`
- Demonstrates transaction completion events

#### **Get Operation** (Lines 44-50)
- Creates readonly transaction
- Uses `getAll()` to retrieve all records
- Demonstrates bulk data retrieval

#### **Update Operation** (Lines 52-67)
- Creates readwrite transaction
- Retrieves record by ID using `get()`
- Modifies the record (increments age)
- Saves changes using `put()`

#### **Delete Operation** (Lines 69-74)
- Creates readwrite transaction
- Removes record by ID using `delete()`
- Demonstrates simple deletion

#### **Cursor-Based Filtering** (Lines 76-92)
- Opens cursor for iteration
- Filters records based on custom criteria (age >= 18)
- Demonstrates advanced querying without indexes
- Shows how to process records sequentially

### 3. [`styles.css`](static/styles.css)

**Role**: Visual Presentation Layer
- Clean, modern interface styling
- Fixed position output terminal
- Monospace font with green-on-black console theme
- Responsive button layout

### 4. [`package.json`](package.json)

**Role**: Module Configuration
- Enables ES6 module syntax (`type: "module"`)
- Allows `import`/`export` statements
- No external dependencies (pure native implementation)

## Key IndexedDB Concepts Demonstrated

### 1. Database Opening and Version Management

```javascript
const request = indexedDB.open('Example', 1);
```

- **Database Name**: 'Example'
- **Version**: 1 (increment this to trigger schema changes)
- **Event**: `onupgradeneeded` fires when version changes

### 2. Object Stores

```javascript
db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
```

- **Object Store**: Similar to a database table
- **Key Path**: Primary key field ('id')
- **Auto Increment**: Automatically generates sequential IDs

### 3. Transactions

**Why Transactions?**
- All IndexedDB operations must occur within transactions
- Provides ACID properties (Atomicity, Consistency, Isolation, Durability)
- Two modes: `'readonly'` and `'readwrite'`

**Readonly Transaction** (for queries):
```javascript
const tx = db.transaction('user', 'readonly');
```

**Readwrite Transaction** (for modifications):
```javascript
const tx = db.transaction('user', 'readwrite');
```

### 4. CRUD Operations

| Operation | Method | Transaction Mode |
|-----------|--------|------------------|
| Create | `add(object)` | readwrite |
| Read | `get(key)` or `getAll()` | readonly |
| Update | `put(object)` | readwrite |
| Delete | `delete(key)` | readwrite |

### 5. Event-Based Callbacks

IndexedDB uses an event-driven model:

```javascript
request.onsuccess = () => { /* handle success */ };
request.onerror = () => { /* handle error */ };
tx.oncomplete = () => { /* transaction completed */ };
```

### 6. Cursors for Advanced Queries

Cursors allow iteration through records:

```javascript
const req = store.openCursor();
req.onsuccess = (event) => {
  const cursor = event.target.result;
  if (cursor) {
    // Process cursor.value
    cursor.continue(); // Move to next record
  }
};
```

## Running the Application

### Prerequisites
- Modern web browser with IndexedDB support (Chrome, Firefox, Edge, Safari)
- Web server to serve static files (required due to module type)

### Setup

1. **Start the server** from the project root:
   ```bash
   node server.js
   ```

2. **Open browser** and navigate to:
   ```
   http://localhost:8000/Native/static/
   ```

### Usage Workflow

1. **Add Users**: Click "Add User" and enter name and age
2. **View All**: Click "Get All Users" to see all records
3. **Update**: Click "Update User 1" to increment the age of user with ID=1
4. **Delete**: Click "Delete User 2" to remove user with ID=2
5. **Filter**: Click "Find Adults" to see users aged 18 and above

All operations display results in the terminal-style output area below the buttons.

## Understanding the Code Flow

### Operation Lifecycle Example (Add User)

```
User clicks "Add User"
    ↓
Prompt for user input (name, age)
    ↓
Create readwrite transaction
    ↓
Get object store from transaction
    ↓
Call store.add({ name, age })
    ↓
Transaction processes the addition
    ↓
Transaction completes (oncomplete event)
    ↓
Logger displays result
```

### Transaction Lifecycle

```
Create transaction
    ↓
Get object store(s)
    ↓
Perform operation(s)
    ↓
Transaction auto-commits when no more operations queued
    ↓
oncomplete or onerror event fires
```

## Advantages of This Native Approach

### ✅ Pros

1. **No Dependencies**: Zero external libraries, minimal bundle size
2. **Educational Value**: Learn the actual IndexedDB API without abstraction
3. **Full Control**: Direct access to all IndexedDB features
4. **Performance**: No overhead from wrapper libraries
5. **Browser Support**: Works in all modern browsers natively

### ⚠️ Cons

1. **Verbose Syntax**: Event callbacks instead of Promises
2. **Manual Error Handling**: Must handle every request's error event
3. **Complexity**: Transaction and event management can be tricky
4. **No Abstraction**: Repetitive code for similar operations
5. **Learning Curve**: Requires understanding IndexedDB's event model

## Comparison with Other Implementations

| Feature | Native | Pragmatic | Enterprise |
|---------|--------|-----------|------------|
| Abstraction Level | None | Medium | High |
| Code Verbosity | High | Medium | Low |
| Learning Curve | Steep | Moderate | Gentle |
| Flexibility | Maximum | High | Structured |
| Dependencies | None | Minimal | Framework-based |
| Use Case | Learning/Simple apps | Medium apps | Large-scale apps |

## Best Practices Demonstrated

1. **Promise Wrapping**: Database opening is wrapped in Promise for cleaner async handling
2. **Transaction Scoping**: Each operation creates its own transaction
3. **Error Handling**: Every request has error handlers
4. **User Feedback**: Logger provides immediate visual feedback
5. **Transaction Modes**: Appropriate use of readonly vs readwrite
6. **Cursor Patterns**: Proper cursor iteration with continuation

## Common Pitfalls Avoided

1. **Transaction Auto-Closure**: Operations are performed synchronously within transaction creation
2. **Null Checks**: Update operation checks if record exists before modifying
3. **Type Validation**: Age input is validated as integer
4. **Event Handling**: All events (success, error, complete) are properly handled

## Browser Developer Tools

To inspect the database:

1. Open **Developer Tools** (F12)
2. Navigate to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **IndexedDB** → **Example** → **user**
4. View, edit, or delete records directly

## Further Learning

This implementation teaches:

- **IndexedDB Fundamentals**: Core API and concepts
- **Event-Driven Programming**: Callback-based async operations
- **Transaction Management**: ACID properties in browser
- **NoSQL Concepts**: Key-value storage without SQL
- **Browser Storage APIs**: IndexedDB vs localStorage vs sessionStorage

## Technical Specifications

- **Database Name**: `Example`
- **Database Version**: `1`
- **Object Store**: `user`
- **Key Path**: `id` (auto-incrementing)
- **Storage Capacity**: Browser-dependent (typically 50MB+)
- **Persistence**: Data persists across browser sessions

## Conclusion

This Native implementation serves as a foundational example for understanding how IndexedDB works at its core. While more verbose than abstracted implementations, it provides invaluable insight into the underlying mechanisms of client-side database storage in web browsers. Use this as a learning tool before adopting higher-level abstractions in production applications.

---

**Next Steps**: After understanding this native implementation, explore the [Pragmatic](../Pragmatic/) implementation for a balanced approach, or [Enterprise](../Enterprise/) for a production-ready architecture.
