# API Documentation

## Overview

The Family Tree Builder API provides a GraphQL interface for managing family trees, persons, and relationships.

## Base URL

- Development: `http://localhost:5000/graphql`
- Production: Configure via environment variables

## GraphQL Playground

Access the interactive GraphQL Playground at `/graphql` to explore the API.

## Authentication

*Note: Authentication is not yet implemented. Add your authentication mechanism as needed.*

## Schema

### Types

#### Person

Represents an individual in the family tree.

```graphql
type Person {
  id: ID!
  treeId: ID!
  firstName: String!
  lastName: String!
  gender: Gender
  dateOfBirth: DateTime
  dateOfDeath: DateTime
  placeOfBirth: String
  placeOfDeath: String
  notes: String
  photoUrl: String
  positionX: Float!
  positionY: Float!
}

enum Gender {
  MALE
  FEMALE
  OTHER
  UNKNOWN
}
```

#### Tree

Represents a family tree.

```graphql
type Tree {
  id: ID!
  ownerId: ID!
  name: String!
  description: String
  isPublic: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime
  settings: TreeSettings
}

type TreeSettings {
  defaultLayout: TreeLayout
}

enum TreeLayout {
  VERTICAL
  HORIZONTAL
  RADIAL
}
```

#### Relationship

Represents a relationship between two persons.

```graphql
type Relationship {
  id: ID!
  treeId: ID!
  fromPersonId: ID!
  toPersonId: ID!
  type: RelationshipType!
}

enum RelationshipType {
  PARENT
  CHILD
  SPOUSE
  SIBLING
}
```

## Queries

### Trees

#### Get Tree by ID

```graphql
query GetTree($id: ID!) {
  tree(id: $id) {
    id
    name
    description
    isPublic
    createdAt
    updatedAt
    settings {
      defaultLayout
    }
  }
}
```

**Variables:**
```json
{
  "id": "tree-id-here"
}
```

#### Get Trees by Owner

```graphql
query GetTreesByOwner($ownerId: ID!) {
  treesByOwner(ownerId: $ownerId) {
    id
    name
    description
    isPublic
    createdAt
  }
}
```

### Persons

#### Get Person by ID

```graphql
query GetPerson($id: ID!) {
  person(id: $id) {
    id
    treeId
    firstName
    lastName
    gender
    dateOfBirth
    dateOfDeath
    placeOfBirth
    placeOfDeath
    notes
    photoUrl
    positionX
    positionY
  }
}
```

#### Get Persons by Tree

```graphql
query GetPersonsByTree($treeId: ID!) {
  personsByTree(treeId: $treeId) {
    id
    firstName
    lastName
    gender
    positionX
    positionY
  }
}
```

### Relationships

#### Get Relationships by Tree

```graphql
query GetRelationshipsByTree($treeId: ID!) {
  relationshipsByTree(treeId: $treeId) {
    id
    fromPersonId
    toPersonId
    type
  }
}
```

#### Get Relationships by Person

```graphql
query GetRelationshipsByPerson($personId: ID!) {
  relationshipsByPerson(personId: $personId) {
    id
    fromPersonId
    toPersonId
    type
  }
}
```

## Mutations

### Trees

#### Create Tree

```graphql
mutation CreateTree($input: CreateTreeInput!) {
  createTree(input: $input) {
    id
    name
    description
    createdAt
  }
}
```

**Input:**
```json
{
  "input": {
    "ownerId": "user-id",
    "name": "Smith Family Tree",
    "description": "Our family history",
    "isPublic": false
  }
}
```

#### Update Tree

```graphql
mutation UpdateTree($id: ID!, $input: UpdateTreeInput!) {
  updateTree(id: $id, input: $input) {
    id
    name
    description
    isPublic
    updatedAt
  }
}
```

#### Delete Tree

```graphql
mutation DeleteTree($id: ID!) {
  deleteTree(id: $id)
}
```

**Returns:** `Boolean` - `true` if deletion was successful

### Persons

#### Create Person

```graphql
mutation CreatePerson($input: CreatePersonInput!) {
  createPerson(input: $input) {
    id
    firstName
    lastName
    gender
  }
}
```

**Input:**
```json
{
  "input": {
    "treeId": "tree-id",
    "firstName": "John",
    "lastName": "Smith",
    "gender": "MALE",
    "dateOfBirth": "1950-05-15",
    "placeOfBirth": "New York, NY",
    "positionX": 100,
    "positionY": 200
  }
}
```

#### Update Person

```graphql
mutation UpdatePerson($id: ID!, $input: UpdatePersonInput!) {
  updatePerson(id: $id, input: $input) {
    id
    firstName
    lastName
    notes
    positionX
    positionY
  }
}
```

#### Delete Person

```graphql
mutation DeletePerson($id: ID!) {
  deletePerson(id: $id)
}
```

### Relationships

#### Create Relationship

```graphql
mutation CreateRelationship($input: CreateRelationshipInput!) {
  createRelationship(input: $input) {
    id
    fromPersonId
    toPersonId
    type
  }
}
```

**Input:**
```json
{
  "input": {
    "treeId": "tree-id",
    "fromPersonId": "person-1-id",
    "toPersonId": "person-2-id",
    "type": "PARENT"
  }
}
```

#### Delete Relationship

```graphql
mutation DeleteRelationship($id: ID!) {
  deleteRelationship(id: $id)
}
```

## Error Handling

Errors are returned in the standard GraphQL format:

```json
{
  "data": null,
  "errors": [
    {
      "message": "Person not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["person"],
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | The requested resource was not found |
| `VALIDATION_ERROR` | Input validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `INTERNAL_ERROR` | Server error |

## Rate Limiting

*Not yet implemented. Consider adding rate limiting for production use.*

## Pagination

For queries that return lists, pagination can be implemented using cursor-based pagination:

```graphql
query GetPersonsByTree($treeId: ID!, $first: Int, $after: String) {
  personsByTree(treeId: $treeId, first: $first, after: $after) {
    edges {
      node {
        id
        firstName
        lastName
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

*Note: Cursor-based pagination is a suggested enhancement.*

## Subscriptions

*Not yet implemented. GraphQL subscriptions can be added for real-time updates.*

Example subscription design:

```graphql
subscription OnPersonUpdated($treeId: ID!) {
  personUpdated(treeId: $treeId) {
    id
    firstName
    lastName
    positionX
    positionY
  }
}
```
