# Family Tree Builder

A full-stack application for creating, viewing, and editing family trees with a modern graph-based interface.

## 🚀 Features

- **Interactive Family Tree Editor**: View and edit family trees as interactive graphs on a canvas
- **GraphQL API**: Modern GraphQL API for flexible data querying
- **CQRS Architecture**: Command Query Responsibility Segregation using Wolverine
- **MongoDB Storage**: Document-based storage with MongoDB 8
- **Modern React Frontend**: TypeScript React app with Material-UI and ReactFlow
- **Docker Support**: Full containerization with Docker Compose for local development
- **Kubernetes Ready**: Helm charts for Kubernetes deployment

## 📋 Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (Preview)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## 🏗️ Project Structure

```
family-tree-builder/
├── src/
│   ├── FamilyTree.Domain/          # Domain entities and repository interfaces
│   ├── FamilyTree.Application/     # CQRS commands, queries, and handlers
│   ├── FamilyTree.Infrastructure/  # MongoDB repositories and data access
│   └── FamilyTree.Api/            # GraphQL API with Wolverine integration
├── frontend/                       # React TypeScript frontend
├── tests/
│   ├── FamilyTree.Domain.Tests/        # Domain unit tests
│   ├── FamilyTree.Application.Tests/   # Application layer tests
│   └── FamilyTree.Infrastructure.Tests/ # Integration tests with TestContainers
├── charts/
│   └── family-tree/               # Helm chart for Kubernetes
├── docker-compose.yml             # Docker Compose configuration
└── Dockerfile.api                 # API Dockerfile
```

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The services will be available at:
- Frontend: http://localhost:3000
- GraphQL API: http://localhost:5000/graphql
- GraphQL Playground: http://localhost:5000/graphql

### Local Development

#### Backend (.NET API)

```bash
# Navigate to API project
cd src/FamilyTree.Api

# Restore dependencies
dotnet restore

# Run the API (requires MongoDB running)
dotnet run
```

#### Frontend (React)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🧪 Running Tests

### Unit Tests

```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test tests/FamilyTree.Domain.Tests
dotnet test tests/FamilyTree.Application.Tests

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Integration Tests (with TestContainers)

Integration tests use TestContainers to spin up a MongoDB container automatically.

```bash
# Run integration tests (requires Docker)
dotnet test tests/FamilyTree.Infrastructure.Tests
```

## 📡 GraphQL API

### Queries

```graphql
# Get a single tree
query GetTree($id: ID!) {
  tree(id: $id) {
    id
    name
    description
    isPublic
    createdAt
  }
}

# Get all trees for a user
query GetUserTrees($ownerId: ID!) {
  treesByOwner(ownerId: $ownerId) {
    id
    name
    createdAt
  }
}

# Get a person
query GetPerson($id: ID!) {
  person(id: $id) {
    id
    firstName
    lastName
    gender
    dateOfBirth
    positionX
    positionY
  }
}

# Get all persons in a tree
query GetTreePersons($treeId: ID!) {
  personsByTree(treeId: $treeId) {
    id
    firstName
    lastName
  }
}

# Get relationships in a tree
query GetTreeRelationships($treeId: ID!) {
  relationshipsByTree(treeId: $treeId) {
    id
    fromPersonId
    toPersonId
    type
  }
}
```

### Mutations

```graphql
# Create a new tree
mutation CreateTree($input: CreateTreeInput!) {
  createTree(input: $input) {
    id
    name
    createdAt
  }
}

# Create a new person
mutation CreatePerson($input: CreatePersonInput!) {
  createPerson(input: $input) {
    id
    firstName
    lastName
  }
}

# Create a relationship
mutation CreateRelationship($input: CreateRelationshipInput!) {
  createRelationship(input: $input) {
    id
    type
  }
}

# Update a person
mutation UpdatePerson($id: ID!, $input: UpdatePersonInput!) {
  updatePerson(id: $id, input: $input) {
    id
    firstName
    lastName
  }
}

# Delete a person
mutation DeletePerson($id: ID!) {
  deletePerson(id: $id)
}
```

## ☸️ Kubernetes Deployment

### Using Helm

```bash
# Add the values file customization
cd charts/family-tree

# Install the chart
helm install family-tree . -n family-tree --create-namespace

# Upgrade existing installation
helm upgrade family-tree . -n family-tree

# Uninstall
helm uninstall family-tree -n family-tree
```

### Configuration

Edit `charts/family-tree/values.yaml` to customize:

- Replica counts
- Resource limits
- Ingress settings
- MongoDB configuration
- Image tags

## 🔧 Configuration

### API Configuration

The API is configured via `appsettings.json` or environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `MongoDB__ConnectionString` | MongoDB connection string | `mongodb://localhost:27017` |
| `MongoDB__DatabaseName` | Database name | `FamilyTreeDb` |
| `ASPNETCORE_ENVIRONMENT` | Environment | `Development` |

### Frontend Configuration

Environment variables for the frontend:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GRAPHQL_ENDPOINT` | GraphQL API URL | `http://localhost:5000/graphql` |

## 🏛️ Architecture

### Backend Architecture

The backend follows Clean Architecture principles with CQRS:

```
┌─────────────────────────────────────────────────────────┐
│                     API Layer                           │
│           (GraphQL, Controllers, Middleware)            │
├─────────────────────────────────────────────────────────┤
│                  Application Layer                      │
│        (Commands, Queries, Handlers, DTOs)              │
├─────────────────────────────────────────────────────────┤
│                   Domain Layer                          │
│          (Entities, Repository Interfaces)              │
├─────────────────────────────────────────────────────────┤
│                Infrastructure Layer                     │
│          (MongoDB Repositories, Data Access)            │
└─────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── graphql/        # GraphQL client and queries
│   ├── store/          # Zustand state management
│   └── types/          # TypeScript type definitions
```

## 📦 Tech Stack

### Backend
- **.NET 10** - Latest .NET runtime
- **Wolverine** - CQRS and messaging
- **HotChocolate** - GraphQL server
- **MongoDB.Driver** - MongoDB client
- **Serilog** - Structured logging

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI 6** - Component library
- **ReactFlow** - Graph visualization
- **Apollo Client** - GraphQL client
- **Zustand** - State management

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Local orchestration
- **Helm** - Kubernetes package manager
- **MongoDB 8** - Document database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
