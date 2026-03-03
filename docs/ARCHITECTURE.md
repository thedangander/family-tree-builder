# Architecture Documentation

## Overview

Family Tree Builder follows Clean Architecture principles, separating concerns into distinct layers that depend inward toward the domain core.

## Architectural Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
│                     (API, Frontend, GraphQL)                     │
├─────────────────────────────────────────────────────────────────┤
│                        Application Layer                         │
│              (Commands, Queries, Handlers, DTOs)                 │
├─────────────────────────────────────────────────────────────────┤
│                          Domain Layer                            │
│               (Entities, Repository Interfaces)                  │
├─────────────────────────────────────────────────────────────────┤
│                      Infrastructure Layer                        │
│             (MongoDB, External Services, Data Access)            │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Details

### Domain Layer (`FamilyTree.Domain`)

The domain layer contains the core business entities and repository interfaces. It has no dependencies on other layers.

**Entities:**
- `Person` - Represents an individual in the family tree
- `Tree` - Represents a family tree collection
- `Relationship` - Represents connections between persons
- `User` - Represents an application user

**Repository Interfaces:**
- `IPersonRepository`
- `ITreeRepository`
- `IRelationshipRepository`
- `IUserRepository`

### Application Layer (`FamilyTree.Application`)

The application layer contains the business logic and use cases, implemented using the CQRS pattern with Wolverine.

**Commands (Write Operations):**
```csharp
// Create operations
CreatePersonCommand → CreatePersonCommandHandler
CreateTreeCommand → CreateTreeCommandHandler
CreateRelationshipCommand → CreateRelationshipCommandHandler

// Update operations
UpdatePersonCommand → UpdatePersonCommandHandler
UpdateTreeCommand → UpdateTreeCommandHandler

// Delete operations
DeletePersonCommand → DeletePersonCommandHandler
DeleteTreeCommand → DeleteTreeCommandHandler
DeleteRelationshipCommand → DeleteRelationshipCommandHandler
```

**Queries (Read Operations):**
```csharp
GetPersonQuery → GetPersonQueryHandler
GetPersonsByTreeQuery → GetPersonsByTreeQueryHandler
GetTreeQuery → GetTreeQueryHandler
GetTreesByOwnerQuery → GetTreesByOwnerQueryHandler
GetRelationshipsByTreeQuery → GetRelationshipsByTreeQueryHandler
GetRelationshipsByPersonQuery → GetRelationshipsByPersonQueryHandler
```

### Infrastructure Layer (`FamilyTree.Infrastructure`)

The infrastructure layer implements the repository interfaces and handles data persistence.

**Components:**
- `MongoDbContext` - MongoDB database context
- `MongoDbSettings` - Configuration options
- Repository implementations:
  - `PersonRepository`
  - `TreeRepository`
  - `RelationshipRepository`
  - `UserRepository`

### API Layer (`FamilyTree.Api`)

The API layer exposes the application through GraphQL endpoints.

**Components:**
- GraphQL Schema (Query, Mutation, Types)
- Dependency injection configuration
- Middleware (logging, error handling)

## CQRS Pattern

We use CQRS (Command Query Responsibility Segregation) to separate read and write operations:

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   GraphQL   │────▶│  Command/Query   │────▶│   Handler    │
│   Mutation  │     │    (Message)     │     │              │
└─────────────┘     └──────────────────┘     └──────────────┘
                              │
                              │ Wolverine
                              ▼
                    ┌──────────────────┐
                    │    Repository    │
                    │  (via Handler)   │
                    └──────────────────┘
```

### Benefits of CQRS:
1. **Separation of Concerns** - Read and write models can evolve independently
2. **Scalability** - Read and write operations can be scaled separately
3. **Testability** - Commands and queries are easily unit testable
4. **Auditability** - Commands can be logged for audit trails

## Data Flow

### Write Operation (Command)

```
1. GraphQL Mutation received
2. Mutation resolver creates Command
3. Command sent via Wolverine IMessageBus
4. Handler receives Command
5. Handler uses Repository to persist data
6. Result returned through call stack
```

### Read Operation (Query)

```
1. GraphQL Query received
2. Query resolver creates Query
3. Query sent via Wolverine IMessageBus
4. Handler receives Query
5. Handler uses Repository to fetch data
6. Data returned through call stack
```

## Frontend Architecture

The React frontend follows a component-based architecture with centralized state management.

```
┌─────────────────────────────────────────────────────────────┐
│                         Components                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │  Components │  │   PersonNode        │  │
│  │ (TreeEditor,│  │ (Dialogs,   │  │  (ReactFlow Node)   │  │
│  │  TreeList)  │  │  Panels)    │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                       State Layer                            │
│              (Zustand Store - familyTreeStore)               │
├─────────────────────────────────────────────────────────────┤
│                       Data Layer                             │
│                  (Apollo Client - GraphQL)                   │
└─────────────────────────────────────────────────────────────┘
```

### State Management (Zustand)

```typescript
// Store structure
{
  // Data
  currentTree: Tree | null
  persons: Person[]
  relationships: Relationship[]
  
  // UI State
  selectedPersonId: string | null
  isLoading: boolean
  
  // Actions
  setCurrentTree(tree)
  addPerson(person)
  updatePerson(id, updates)
  deletePerson(id)
  addRelationship(relationship)
  deleteRelationship(id)
}
```

### Graph Visualization (ReactFlow)

The family tree is rendered as an interactive graph using ReactFlow:

- **Nodes** - Represent persons (custom PersonNode component)
- **Edges** - Represent relationships
- **Drag & Drop** - Update person positions
- **Pan & Zoom** - Navigate the tree

## Data Model

### MongoDB Collections

```
FamilyTreeDb
├── persons
│   └── { _id, treeId, firstName, lastName, gender, ... }
├── trees
│   └── { _id, ownerId, name, description, isPublic, ... }
├── relationships
│   └── { _id, treeId, fromPersonId, toPersonId, type }
└── users
    └── { _id, email, displayName, createdAt, ... }
```

### Relationship Types

```
PARENT ──────────▶ Child inherits from parent
CHILD ◀────────── Parent has child
SPOUSE ◀─────────▶ Marriage/Partnership
SIBLING ◀────────▶ Share parents
```

## Deployment Architecture

### Docker Compose (Development)

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   MongoDB   │  │     API     │  │      Frontend       │  │
│  │   :27017    │◀─│    :5000    │◀─│       :3000         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Kubernetes (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                      Kubernetes Cluster                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                      Ingress                         │    │
│  │              /graphql → API Service                  │    │
│  │              /       → Frontend Service              │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│           ┌────────────────┴────────────────┐               │
│           ▼                                 ▼               │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │   API Service   │              │Frontend Service │       │
│  │   Deployment    │              │   Deployment    │       │
│  │  (replicas: 2)  │              │  (replicas: 2)  │       │
│  └─────────────────┘              └─────────────────┘       │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │    MongoDB      │                                        │
│  │  StatefulSet    │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations

### Current Implementation
- GraphQL introspection enabled in development
- No authentication (to be added)

### Recommended Enhancements
1. **Authentication** - JWT or OAuth2
2. **Authorization** - Role-based access control
3. **Rate Limiting** - Prevent abuse
4. **Input Validation** - Sanitize all inputs
5. **HTTPS** - Encrypt all traffic
6. **Secrets Management** - Use Kubernetes secrets or vault

## Performance Considerations

### Database
- Index on `treeId` for persons and relationships
- Index on `ownerId` for trees
- Connection pooling with MongoDB driver

### API
- GraphQL complexity analysis
- Query depth limiting
- Response caching for reads

### Frontend
- Virtualization for large trees
- Lazy loading of person details
- Debounced position updates

## Scalability

### Horizontal Scaling
- Stateless API allows multiple replicas
- Load balancing via Kubernetes service
- MongoDB replica set for database

### Vertical Scaling
- Adjust resource limits in Helm values
- Optimize queries for large trees

## Monitoring & Observability

### Logging
- Structured logging with Serilog
- Log levels: Debug, Information, Warning, Error

### Metrics (Recommended)
- Prometheus metrics endpoint
- Grafana dashboards
- Application performance monitoring

### Tracing (Recommended)
- OpenTelemetry integration
- Distributed tracing for request flow
