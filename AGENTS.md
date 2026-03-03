# AI Agent Guidelines

This document provides context and guidelines for AI coding agents working on the Family Tree Builder codebase.

## Project Overview

A full-stack family tree application with:
- **.NET 10 GraphQL API** (Hot Chocolate)
- **React TypeScript frontend** (Vite, Material-UI, ReactFlow)
- **MongoDB** for persistence
- **Keycloak** for authentication

## Architecture

### Backend (CQRS + Clean Architecture)

```
src/
├── FamilyTree.Domain/          # Entities, interfaces (no dependencies)
├── FamilyTree.Application/     # Commands, queries, handlers, DTOs
├── FamilyTree.Infrastructure/  # MongoDB repositories, external services
├── FamilyTree.Api/            # GraphQL schema, mutations, queries
└── FamilyTree.AppHost/        # .NET Aspire orchestration
```

**Key patterns:**
- Commands modify state → return `Result<T>`
- Queries read data → return DTOs
- Repositories implement interfaces from Domain
- GraphQL resolvers call Application handlers

### Frontend

```
frontend/src/
├── auth/           # OIDC/Keycloak authentication
├── components/     # Reusable React components
├── graphql/        # Apollo Client, queries, mutations
├── pages/          # Route-level page components
├── store/          # Zustand state management
├── types/          # TypeScript interfaces
└── utils/          # Utility functions
```

## Key Files to Know

| Purpose | Location |
|---------|----------|
| GraphQL schema/mutations | `src/FamilyTree.Api/GraphQL/` |
| Domain entities | `src/FamilyTree.Domain/Entities/` |
| Repository interfaces | `src/FamilyTree.Domain/Interfaces/` |
| Application commands | `src/FamilyTree.Application/*/Commands/` |
| Application queries | `src/FamilyTree.Application/*/Queries/` |
| MongoDB repositories | `src/FamilyTree.Infrastructure/Repositories/` |
| Frontend GraphQL queries | `frontend/src/graphql/queries.ts` |
| Frontend types | `frontend/src/types/index.ts` |
| Tree editor (main UI) | `frontend/src/pages/TreeEditorPage.tsx` |

## Common Tasks

### Adding a New Entity Field

1. Add property to entity in `FamilyTree.Domain/Entities/`
2. Add to DTO in `FamilyTree.Application/DTOs/`
3. Update relevant commands/queries in `FamilyTree.Application/`
4. Add to GraphQL types in `FamilyTree.Api/GraphQL/`
5. Update frontend types in `frontend/src/types/index.ts`
6. Update GraphQL queries in `frontend/src/graphql/queries.ts`
7. Add tests

### Adding a New Command

1. Create command record in `FamilyTree.Application/{Feature}/Commands/`
2. Create handler class (static `Handle` method returning `Result<T>`)
3. Add GraphQL mutation in `FamilyTree.Api/GraphQL/Mutation.cs`
4. Add frontend mutation in `frontend/src/graphql/queries.ts`
5. Add unit tests

### Adding a New Query

1. Create query record in `FamilyTree.Application/{Feature}/Queries/`
2. Create handler class
3. Add GraphQL query in `FamilyTree.Api/GraphQL/Query.cs`
4. Add frontend query in `frontend/src/graphql/queries.ts`
5. Add unit tests

## Testing

```bash
# Run all backend tests
dotnet test

# Run specific test project
dotnet test tests/FamilyTree.Domain.Tests
dotnet test tests/FamilyTree.Application.Tests
dotnet test tests/FamilyTree.Infrastructure.Tests  # Requires Docker

# Run frontend tests
cd frontend && npm test
```

**Test patterns:**
- Domain tests: Pure unit tests, no mocking needed
- Application tests: Mock repositories using NSubstitute
- Infrastructure tests: Use TestContainers for real MongoDB

## Local Development

```bash
# Option 1: Docker Compose (recommended)
docker-compose up -d

# Option 2: Manual
# Terminal 1: Start MongoDB
docker run -p 27017:27017 mongo:8.0

# Terminal 2: Start API
cd src/FamilyTree.Api && dotnet run

# Terminal 3: Start frontend
cd frontend && npm run dev
```

## Code Conventions

### C# (.NET)

- Use records for commands, queries, and DTOs
- Use `Result<T>` pattern for operation outcomes
- Add XML doc comments to public APIs
- MongoDB attributes: `[BsonId]`, `[BsonElement("camelCase")]`

### TypeScript/React

- Functional components with hooks
- Zustand for global state
- Apollo Client for GraphQL
- Material-UI components

## Sensitive Data

**Do NOT commit:**
- Real email addresses (use `@example.com`)
- Actual names or PII (use placeholders like "John Doe")
- Production credentials or API keys
- Environment files (`.env*` is gitignored)

**Acceptable test data:**
- demo@example.com, test@example.com
- John Doe, Jane Smith, Bob Smith
- Placeholder dates like 1980-05-15
- localhost URLs and development credentials

## Important Notes

1. **MongoDB**: Uses connection string `mongodb://localhost:27017` in dev
2. **Authentication**: Keycloak with realm config in `keycloak/familytree-realm.json`
3. **GraphQL Playground**: Available at `http://localhost:5000/graphql`
4. **Frontend hot reload**: Vite at `http://localhost:3000`
5. **Tests use TestContainers**: Infrastructure tests spin up real MongoDB

## Documentation

- [README.md](README.md) - Project overview and setup
- [docs/API.md](docs/API.md) - GraphQL API reference
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detailed architecture
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - Development guide
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment instructions
