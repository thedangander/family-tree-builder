# Contributing to Family Tree Builder

Thank you for your interest in contributing to Family Tree Builder! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Set up your development environment** following the [README](README.md)
3. **Create a branch** for your changes: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- .NET 10 SDK (Preview)
- Node.js 20+
- Docker and Docker Compose
- MongoDB (or use Docker Compose)

### Running Locally

```bash
# Start infrastructure (MongoDB, Keycloak)
docker-compose up -d mongodb keycloak

# Run the backend
cd src/FamilyTree.Api
dotnet run

# In another terminal, run the frontend
cd frontend
npm install
npm run dev
```

## Project Architecture

This project follows **Clean Architecture** with **CQRS** (Command Query Responsibility Segregation):

- **FamilyTree.Domain** - Core entities, interfaces, and business rules
- **FamilyTree.Application** - Commands, queries, handlers, and DTOs
- **FamilyTree.Infrastructure** - MongoDB repositories and external services
- **FamilyTree.Api** - GraphQL API layer with Hot Chocolate

## Making Changes

### Code Style

- **C#**: Follow Microsoft's [C# coding conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- **TypeScript/React**: Use ESLint configuration provided in the project
- Use meaningful variable and function names
- Add XML documentation comments for public APIs

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add person search functionality
fix: resolve relationship deletion cascade issue
docs: update API documentation
test: add unit tests for CreatePersonHandler
refactor: extract common validation logic
```

### Testing Requirements

All changes should include appropriate tests:

- **Domain logic** → Unit tests in `FamilyTree.Domain.Tests`
- **Application handlers** → Unit tests in `FamilyTree.Application.Tests`
- **Repository/data access** → Integration tests in `FamilyTree.Infrastructure.Tests`
- **Frontend components** → Tests using Vitest and Testing Library

Run all tests before submitting:

```bash
# Backend tests
dotnet test

# Frontend tests
cd frontend && npm test
```

## Pull Request Process

1. **Ensure all tests pass** locally
2. **Update documentation** if you've changed APIs or added features
3. **Fill out the PR template** with a clear description
4. **Link any related issues** using keywords like "Fixes #123"
5. **Request review** from maintainers

### PR Checklist

- [ ] Tests added/updated for changes
- [ ] Documentation updated if needed
- [ ] No sensitive data or credentials committed
- [ ] Code follows project style guidelines
- [ ] All CI checks pass

## Reporting Issues

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, .NET version, Node version)
- Relevant logs or error messages

## Feature Requests

For new features:

1. **Check existing issues** to avoid duplicates
2. **Open a discussion** to propose the feature
3. **Wait for feedback** before investing significant time

## Questions?

- Check the [documentation](docs/) folder
- Open a GitHub Discussion for questions
- Review existing issues and PRs for context

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
