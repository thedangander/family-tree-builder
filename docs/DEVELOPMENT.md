# Development Guide

## Getting Started

This guide helps you set up the development environment for the Family Tree Service.

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| .NET SDK | 10.0+ (Preview) | Backend API |
| Node.js | 20+ | Frontend |
| Docker | Latest | Containerization |
| Docker Compose | Latest | Local orchestration |
| Git | Latest | Version control |

### Optional Software

| Software | Purpose |
|----------|---------|
| VS Code | IDE with extensions |
| Rider | JetBrains .NET IDE |
| MongoDB Compass | Database GUI |
| Helm | Kubernetes deployments |

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/family-tree-service.git
cd family-tree-service
```

### 2. Install .NET 10 Preview

```bash
# macOS with Homebrew
brew install --cask dotnet-sdk-preview

# Or download from Microsoft
# https://dotnet.microsoft.com/download/dotnet/10.0
```

Verify installation:
```bash
dotnet --version
# Should show 10.0.x
```

### 3. Install Node.js

```bash
# macOS with Homebrew
brew install node@20

# Or use nvm
nvm install 20
nvm use 20
```

### 4. Start MongoDB

Using Docker Compose:
```bash
docker-compose up -d mongodb
```

Or standalone:
```bash
docker run -d --name mongodb -p 27017:27017 mongo:8.0
```

## Running the Application

### Option 1: Docker Compose (Full Stack)

```bash
# Build and start all services
docker-compose up --build

# Or in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f api
docker-compose logs -f frontend
```

### Option 2: Local Development

#### Backend

```bash
# Navigate to API
cd src/FamilyTree.Api

# Restore packages
dotnet restore

# Run in development mode
dotnet run

# Or with file watching
dotnet watch run
```

The API will be available at:
- HTTP: http://localhost:5000
- GraphQL Playground: http://localhost:5000/graphql

#### Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173

## Development Workflow

### Branch Strategy

```
main
├── develop
│   ├── feature/add-search
│   ├── feature/user-auth
│   └── bugfix/person-delete
└── release/v1.0.0
```

### Commit Convention

```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance
```

Examples:
```bash
git commit -m "feat(api): add person search endpoint"
git commit -m "fix(frontend): correct relationship type display"
git commit -m "docs: update API documentation"
```

## Code Style

### C# (.NET)

Follow Microsoft's C# coding conventions:
- Use PascalCase for public members
- Use camelCase for private fields (prefixed with _)
- Use `var` when type is obvious
- Prefer expression-bodied members for simple methods

```csharp
// Good
public class PersonService
{
    private readonly IPersonRepository _repository;
    
    public PersonService(IPersonRepository repository)
    {
        _repository = repository;
    }
    
    public async Task<Person?> GetByIdAsync(string id) 
        => await _repository.GetByIdAsync(id);
}
```

### TypeScript (React)

- Use functional components with hooks
- Use TypeScript strict mode
- Prefer named exports
- Use interfaces for props

```typescript
// Good
interface PersonNodeProps {
  person: Person;
  onSelect: (id: string) => void;
}

export const PersonNode: React.FC<PersonNodeProps> = ({ 
  person, 
  onSelect 
}) => {
  return (
    <div onClick={() => onSelect(person.id)}>
      {person.firstName} {person.lastName}
    </div>
  );
};
```

## Testing

### Running Tests

```bash
# All tests
dotnet test

# Specific project
dotnet test tests/FamilyTree.Domain.Tests

# With coverage
dotnet test --collect:"XPlat Code Coverage"

# Frontend tests
cd frontend
npm test
```

### Writing Tests

#### Unit Tests (xUnit)

```csharp
public class PersonTests
{
    [Fact]
    public void Person_ShouldHaveDefaultValues()
    {
        // Arrange & Act
        var person = new Person();

        // Assert
        person.PositionX.Should().Be(0);
        person.PositionY.Should().Be(0);
    }

    [Theory]
    [InlineData(Gender.Male)]
    [InlineData(Gender.Female)]
    public void Person_ShouldAcceptValidGender(Gender gender)
    {
        // Arrange & Act
        var person = new Person { Gender = gender };

        // Assert
        person.Gender.Should().Be(gender);
    }
}
```

#### Integration Tests (TestContainers)

```csharp
[Collection("MongoDB")]
public class PersonRepositoryTests
{
    private readonly MongoDbFixture _fixture;

    public PersonRepositoryTests(MongoDbFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CreateAsync_ShouldPersistPerson()
    {
        // Arrange
        var context = _fixture.CreateContext();
        var repository = new PersonRepository(context);
        var person = new Person { FirstName = "Test" };

        // Act
        var result = await repository.CreateAsync(person);

        // Assert
        result.Id.Should().NotBeNullOrEmpty();
    }
}
```

## Debugging

### VS Code

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": ".NET Core Launch (API)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/src/FamilyTree.Api/bin/Debug/net10.0/FamilyTree.Api.dll",
      "args": [],
      "cwd": "${workspaceFolder}/src/FamilyTree.Api",
      "stopAtEntry": false,
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  ]
}
```

### GraphQL Debugging

Use the GraphQL Playground at `/graphql` to:
- Test queries and mutations
- View schema documentation
- Check response times

### MongoDB Debugging

Connect with MongoDB Compass:
- Connection: `mongodb://localhost:27017`
- Database: `FamilyTreeDb`

## Common Tasks

### Add a New Entity

1. Create entity in `FamilyTree.Domain/Entities/`
2. Create repository interface in `FamilyTree.Domain/Repositories/`
3. Implement repository in `FamilyTree.Infrastructure/Repositories/`
4. Add DbSet to `MongoDbContext`
5. Create commands/queries in `FamilyTree.Application/`
6. Add GraphQL types in `FamilyTree.Api/GraphQL/`

### Add a New API Endpoint

1. Create command/query in Application layer
2. Create handler with Wolverine convention
3. Add to Query or Mutation GraphQL class
4. Update frontend GraphQL queries

### Add a New Frontend Page

1. Create page component in `frontend/src/pages/`
2. Add route in `App.tsx`
3. Create GraphQL queries in `frontend/src/graphql/`
4. Update navigation

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check if MongoDB is running
docker ps | grep mongo

# Check logs
docker logs mongodb

# Restart container
docker-compose restart mongodb
```

### NuGet Restore Failed

```bash
# Clear NuGet cache
dotnet nuget locals all --clear

# Restore with verbose output
dotnet restore --verbosity detailed
```

### Frontend Build Failed

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Docker Build Failed

```bash
# Rebuild without cache
docker-compose build --no-cache

# Check Docker resources
docker system df
docker system prune -f
```

## IDE Extensions

### VS Code

- C# Dev Kit
- ESLint
- Prettier
- GraphQL
- Docker
- MongoDB for VS Code

### Rider

- Key Promoter X
- Rainbow Brackets
- .NET Core User Secrets
