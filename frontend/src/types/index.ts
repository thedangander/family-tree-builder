// Types matching GraphQL schema

export enum Gender {
  UNKNOWN = 'UNKNOWN',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum RelationshipType {
  PARENT = 'PARENT',
  SPOUSE = 'SPOUSE',
}

export enum DocumentType {
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  DEATH_CERTIFICATE = 'DEATH_CERTIFICATE',
  MARRIAGE_CERTIFICATE = 'MARRIAGE_CERTIFICATE',
  DIVORCE_CERTIFICATE = 'DIVORCE_CERTIFICATE',
  PHOTO = 'PHOTO',
  LETTER = 'LETTER',
  WILL_TESTAMENT = 'WILL_TESTAMENT',
  MILITARY_RECORD = 'MILITARY_RECORD',
  IMMIGRATION_RECORD = 'IMMIGRATION_RECORD',
  CENSUS = 'CENSUS',
  OTHER = 'OTHER',
}

export enum TreeLayout {
  HIERARCHICAL = 'HIERARCHICAL',
  RADIAL = 'RADIAL',
  FORCE_DIRECTED = 'FORCE_DIRECTED',
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Document {
  id: string;
  name: string;
  description?: string;
  documentType: DocumentType;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface Person {
  id: string;
  treeId: string;
  firstName: string;
  lastName: string;
  maidenName?: string;
  fullName: string;
  gender: Gender;
  dateOfBirth?: string;
  dateOfDeath?: string;
  placeOfBirth?: string;
  placeOfDeath?: string;
  biography?: string;
  photoUrl?: string;
  occupation?: string;
  email?: string;
  phone?: string;
  address?: Address;
  positionX: number;
  positionY: number;
  isAlive: boolean;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  id: string;
  treeId: string;
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  startDate?: string;
  endDate?: string;
  notes?: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface TreeSettings {
  defaultLayout: TreeLayout;
  showPhotos: boolean;
  showDates: boolean;
  colorScheme: string;
  zoomLevel: number;
  centerX: number;
  centerY: number;
}

export interface Tree {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isPublic: boolean;
  rootPersonId?: string;
  settings: TreeSettings;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyTreeData {
  tree: Tree;
  persons: Person[];
  relationships: Relationship[];
}

// Mutation inputs
export interface CreateTreeInput {
  name: string;
  ownerId: string;
  description?: string;
  isPublic?: boolean;
  defaultLayout?: TreeLayout;
}

export interface UpdateTreeInput {
  id: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  rootPersonId?: string;
  defaultLayout?: TreeLayout;
  showPhotos?: boolean;
  showDates?: boolean;
  colorScheme?: string;
  zoomLevel?: number;
  centerX?: number;
  centerY?: number;
}

export interface CreatePersonInput {
  treeId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  maidenName?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  placeOfBirth?: string;
  placeOfDeath?: string;
  biography?: string;
  photoUrl?: string;
  occupation?: string;
  email?: string;
  phone?: string;
  positionX?: number;
  positionY?: number;
}

export interface UpdatePersonInput {
  id: string;
  firstName?: string;
  lastName?: string;
  maidenName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  dateOfDeath?: string;
  placeOfBirth?: string;
  placeOfDeath?: string;
  biography?: string;
  photoUrl?: string;
  occupation?: string;
  email?: string;
  phone?: string;
  positionX?: number;
  positionY?: number;
}

export interface CreateRelationshipInput {
  treeId: string;
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface UpdateRelationshipInput {
  id: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface AddDocumentInput {
  relationshipId: string;
  name: string;
  description?: string;
  documentType: DocumentType;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
}

// Mutation results
export interface MutationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
