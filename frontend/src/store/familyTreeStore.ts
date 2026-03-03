import { create } from 'zustand';
import { Person, Relationship, Tree, FamilyTreeData } from '../types';

interface FamilyTreeState {
  // Data
  currentTree: Tree | null;
  persons: Person[];
  relationships: Relationship[];
  
  // UI State
  selectedPersonId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setFamilyTreeData: (data: FamilyTreeData) => void;
  setCurrentTree: (tree: Tree | null) => void;
  setPersons: (persons: Person[]) => void;
  setRelationships: (relationships: Relationship[]) => void;
  addPerson: (person: Person) => void;
  updatePerson: (person: Person) => void;
  removePerson: (personId: string) => void;
  addRelationship: (relationship: Relationship) => void;
  updateRelationship: (relationship: Relationship) => void;
  removeRelationship: (relationshipId: string) => void;
  setSelectedPersonId: (personId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentTree: null,
  persons: [],
  relationships: [],
  selectedPersonId: null,
  isLoading: false,
  error: null,
};

export const useFamilyTreeStore = create<FamilyTreeState>((set) => ({
  ...initialState,

  setFamilyTreeData: (data: FamilyTreeData) =>
    set({
      currentTree: data.tree,
      persons: data.persons,
      relationships: data.relationships,
      error: null,
    }),

  setCurrentTree: (tree: Tree | null) => set({ currentTree: tree }),

  setPersons: (persons: Person[]) => set({ persons }),

  setRelationships: (relationships: Relationship[]) => set({ relationships }),

  addPerson: (person: Person) =>
    set((state) => ({ persons: [...state.persons, person] })),

  updatePerson: (person: Person) =>
    set((state) => ({
      persons: state.persons.map((p) => (p.id === person.id ? person : p)),
    })),

  removePerson: (personId: string) =>
    set((state) => ({
      persons: state.persons.filter((p) => p.id !== personId),
      relationships: state.relationships.filter(
        (r) => r.fromPersonId !== personId && r.toPersonId !== personId
      ),
      selectedPersonId:
        state.selectedPersonId === personId ? null : state.selectedPersonId,
    })),

  addRelationship: (relationship: Relationship) =>
    set((state) => ({ relationships: [...state.relationships, relationship] })),

  updateRelationship: (relationship: Relationship) =>
    set((state) => ({
      relationships: state.relationships.map((r) =>
        r.id === relationship.id ? relationship : r
      ),
    })),

  removeRelationship: (relationshipId: string) =>
    set((state) => ({
      relationships: state.relationships.filter((r) => r.id !== relationshipId),
    })),

  setSelectedPersonId: (personId: string | null) =>
    set({ selectedPersonId: personId }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  reset: () => set(initialState),
}));
