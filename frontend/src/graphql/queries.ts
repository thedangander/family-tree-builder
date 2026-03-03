import { gql } from '@apollo/client';

// Fragments
export const PERSON_FRAGMENT = gql`
  fragment PersonFields on Person {
    id
    treeId
    firstName
    lastName
    maidenName
    fullName
    gender
    dateOfBirth
    dateOfDeath
    placeOfBirth
    placeOfDeath
    biography
    photoUrl
    occupation
    email
    phone
    positionX
    positionY
    isAlive
    age
    createdAt
    updatedAt
  }
`;

export const RELATIONSHIP_FRAGMENT = gql`
  fragment RelationshipFields on Relationship {
    id
    treeId
    fromPersonId
    toPersonId
    relationshipType
    startDate
    endDate
    notes
    documents {
      id
      name
      description
      documentType
      fileUrl
      mimeType
      fileSize
      uploadedAt
    }
    createdAt
    updatedAt
  }
`;

export const TREE_FRAGMENT = gql`
  fragment TreeFields on Tree {
    id
    name
    description
    ownerId
    isPublic
    rootPersonId
    createdAt
    updatedAt
    settings {
      defaultLayout
      showPhotos
      showDates
      colorScheme
      zoomLevel
      centerX
      centerY
    }
  }
`;

// Queries
export const GET_TREE = gql`
  ${TREE_FRAGMENT}
  query GetTree($id: String!) {
    tree(id: $id) {
      ...TreeFields
    }
  }
`;

export const GET_TREES_BY_OWNER = gql`
  ${TREE_FRAGMENT}
  query GetTreesByOwner($ownerId: String!) {
    treesByOwner(ownerId: $ownerId) {
      ...TreeFields
    }
  }
`;

export const GET_FAMILY_TREE_DATA = gql`
  ${TREE_FRAGMENT}
  ${PERSON_FRAGMENT}
  ${RELATIONSHIP_FRAGMENT}
  query GetFamilyTreeData($treeId: String!) {
    familyTreeData(treeId: $treeId) {
      tree {
        ...TreeFields
      }
      persons {
        ...PersonFields
      }
      relationships {
        ...RelationshipFields
      }
    }
  }
`;

export const GET_PERSON = gql`
  ${PERSON_FRAGMENT}
  query GetPerson($id: String!) {
    person(id: $id) {
      ...PersonFields
    }
  }
`;

export const GET_PERSONS_BY_TREE = gql`
  ${PERSON_FRAGMENT}
  query GetPersonsByTree($treeId: String!) {
    personsByTree(treeId: $treeId) {
      ...PersonFields
    }
  }
`;

export const GET_RELATIONSHIPS_BY_TREE = gql`
  ${RELATIONSHIP_FRAGMENT}
  query GetRelationshipsByTree($treeId: String!) {
    relationshipsByTree(treeId: $treeId) {
      ...RelationshipFields
    }
  }
`;

// Mutations
export const CREATE_TREE = gql`
  ${TREE_FRAGMENT}
  mutation CreateTree($input: CreateTreeInput!) {
    createTree(input: $input) {
      success
      error
      data {
        ...TreeFields
      }
    }
  }
`;

export const UPDATE_TREE = gql`
  ${TREE_FRAGMENT}
  mutation UpdateTree($input: UpdateTreeInput!) {
    updateTree(input: $input) {
      success
      error
      data {
        ...TreeFields
      }
    }
  }
`;

export const DELETE_TREE = gql`
  mutation DeleteTree($id: String!) {
    deleteTree(id: $id) {
      success
      error
    }
  }
`;

export const CREATE_PERSON = gql`
  ${PERSON_FRAGMENT}
  mutation CreatePerson($input: CreatePersonInput!) {
    createPerson(input: $input) {
      success
      error
      data {
        ...PersonFields
      }
    }
  }
`;

export const UPDATE_PERSON = gql`
  ${PERSON_FRAGMENT}
  mutation UpdatePerson($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
      success
      error
      data {
        ...PersonFields
      }
    }
  }
`;

export const DELETE_PERSON = gql`
  mutation DeletePerson($id: String!) {
    deletePerson(id: $id) {
      success
      error
    }
  }
`;

export const CREATE_RELATIONSHIP = gql`
  ${RELATIONSHIP_FRAGMENT}
  mutation CreateRelationship($input: CreateRelationshipInput!) {
    createRelationship(input: $input) {
      success
      error
      data {
        ...RelationshipFields
      }
    }
  }
`;

export const UPDATE_RELATIONSHIP = gql`
  ${RELATIONSHIP_FRAGMENT}
  mutation UpdateRelationship($input: UpdateRelationshipInput!) {
    updateRelationship(input: $input) {
      success
      error
      data {
        ...RelationshipFields
      }
    }
  }
`;

export const DELETE_RELATIONSHIP = gql`
  mutation DeleteRelationship($id: String!) {
    deleteRelationship(id: $id) {
      success
      error
    }
  }
`;

export const ADD_DOCUMENT_TO_RELATIONSHIP = gql`
  ${RELATIONSHIP_FRAGMENT}
  mutation AddDocumentToRelationship($input: AddDocumentInput!) {
    addDocumentToRelationship(input: $input) {
      success
      error
      data {
        ...RelationshipFields
      }
    }
  }
`;

export const REMOVE_DOCUMENT_FROM_RELATIONSHIP = gql`
  ${RELATIONSHIP_FRAGMENT}
  mutation RemoveDocumentFromRelationship($relationshipId: String!, $documentId: String!) {
    removeDocumentFromRelationship(relationshipId: $relationshipId, documentId: $documentId) {
      success
      error
      data {
        ...RelationshipFields
      }
    }
  }
`;
