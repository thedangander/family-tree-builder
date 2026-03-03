import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  reconnectEdge,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Drawer,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { GET_FAMILY_TREE_DATA, UPDATE_PERSON, CREATE_PERSON, CREATE_RELATIONSHIP, UPDATE_RELATIONSHIP, DELETE_PERSON, DELETE_RELATIONSHIP, ADD_DOCUMENT_TO_RELATIONSHIP, REMOVE_DOCUMENT_FROM_RELATIONSHIP } from '../graphql/queries';
import { useFamilyTreeStore } from '../store/familyTreeStore';
import { PersonNode, HandlePosition } from '../components/PersonNode';
import { PersonDetailsPanel } from '../components/PersonDetailsPanel';
import { AddPersonDialog } from '../components/AddPersonDialog';
import { AddRelationshipDialog } from '../components/AddRelationshipDialog';
import { AddRelatedPersonDialog } from '../components/AddRelatedPersonDialog';
import { EditPersonDialog } from '../components/EditPersonDialog';
import { EditRelationshipDialog } from '../components/EditRelationshipDialog';
import { Person, FamilyTreeData, Gender, RelationshipType, Relationship, AddDocumentInput } from '../types';
import { buildFamilyTreeLayout, computeLineage, getLineageEdges } from '../utils/treeLayout';

const nodeTypes = {
  person: PersonNode,
};

function TreeEditorContent() {
  const { treeId } = useParams<{ treeId: string }>();
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [_selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [addRelationshipOpen, setAddRelationshipOpen] = useState(false);
  const [addRelatedPersonOpen, setAddRelatedPersonOpen] = useState(false);
  const [editPersonOpen, setEditPersonOpen] = useState(false);
  const [editRelationshipOpen, setEditRelationshipOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [handleClickPerson, setHandleClickPerson] = useState<Person | null>(null);
  const [handleClickPosition, setHandleClickPosition] = useState<HandlePosition | null>(null);
  const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const reactFlowInstance = useReactFlow();

  const {
    persons,
    relationships,
    setFamilyTreeData,
    addPerson,
    updatePerson,
    removePerson,
    addRelationship,
    updateRelationship,
    removeRelationship,
    selectedPersonId,
    setSelectedPersonId,
  } = useFamilyTreeStore();

  const { loading, error, data } = useQuery<{ familyTreeData: FamilyTreeData }>(
    GET_FAMILY_TREE_DATA,
    {
      variables: { treeId },
      skip: !treeId,
    }
  );

  const [updatePersonMutation] = useMutation(UPDATE_PERSON);
  const [createPersonMutation] = useMutation(CREATE_PERSON);
  const [createRelationshipMutation] = useMutation(CREATE_RELATIONSHIP);
  const [updateRelationshipMutation] = useMutation(UPDATE_RELATIONSHIP);
  const [deletePersonMutation] = useMutation(DELETE_PERSON);
  const [deleteRelationshipMutation] = useMutation(DELETE_RELATIONSHIP);
  const [addDocumentMutation] = useMutation(ADD_DOCUMENT_TO_RELATIONSHIP);
  const [removeDocumentMutation] = useMutation(REMOVE_DOCUMENT_FROM_RELATIONSHIP);

  // Load data into store
  useEffect(() => {
    if (data?.familyTreeData) {
      setFamilyTreeData(data.familyTreeData);
    }
  }, [data, setFamilyTreeData]);

  // Handle click callback for node handles
  const onHandleClick = useCallback(
    (personId: string, position: HandlePosition) => {
      const person = persons.find((p) => p.id === personId);
      if (person) {
        setHandleClickPerson(person);
        setHandleClickPosition(position);
        setAddRelatedPersonOpen(true);
      }
    },
    [persons]
  );

  // Handle hover for lineage highlighting
  const onNodeHover = useCallback((personId: string | null) => {
    setHoveredPersonId(personId);
  }, []);

  // Compute lineage for the hovered person
  const lineagePersonIds = useMemo(() => {
    if (!hoveredPersonId) return null;
    return computeLineage(hoveredPersonId, relationships);
  }, [hoveredPersonId, relationships]);

  const lineageEdgeIds = useMemo(() => {
    if (!lineagePersonIds) return null;
    return getLineageEdges(lineagePersonIds, relationships);
  }, [lineagePersonIds, relationships]);

  // Build layout when persons or relationships change
  useEffect(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = buildFamilyTreeLayout(persons, relationships);
    // Add the callbacks and dimming state to each node's data
    const nodesWithCallbacks = layoutNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onHandleClick,
        onHover: onNodeHover,
        isDimmed: lineagePersonIds ? !lineagePersonIds.has(node.id) : false,
      },
    }));
    
    // Apply dimming to edges
    const edgesWithDimming = layoutEdges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: lineageEdgeIds ? (lineageEdgeIds.has(edge.id) ? 1 : 0.15) : 1,
        transition: 'opacity 0.2s ease',
      },
    }));
    
    setNodes(nodesWithCallbacks);
    setEdges(edgesWithDimming);
  }, [persons, relationships, setNodes, setEdges, onHandleClick, onNodeHover, lineagePersonIds, lineageEdgeIds]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Only handle selection changes, nodes are not draggable
      const selectionChanges = changes.filter((c) => c.type === 'select');
      if (selectionChanges.length > 0) {
        setNodes((nds) => applyNodeChanges(selectionChanges, nds));
      }
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      // When user drags an edge to a new node, delete old relationship and create new one
      setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
      
      // Delete the old relationship
      deleteRelationshipMutation({ variables: { id: oldEdge.id } })
        .then((result) => {
          if (result.data?.deleteRelationship?.success && newConnection.source && newConnection.target) {
            // Infer relationship type from edge label or default to SPOUSE for horizontal
            const relType = RelationshipType.SPOUSE; // Default, could be enhanced
            
            // Create new relationship
            createRelationshipMutation({
              variables: {
                input: {
                  treeId,
                  fromPersonId: newConnection.source,
                  toPersonId: newConnection.target,
                  relationshipType: relType,
                },
              },
            }).then((createResult) => {
              if (createResult.data?.createRelationship?.success) {
                removeRelationship(oldEdge.id);
                addRelationship(createResult.data.createRelationship.data);
                setSuccessMessage('Relationship updated');
              } else {
                setErrorMessage('Failed to create new relationship');
              }
            });
          } else {
            setErrorMessage('Failed to update relationship');
          }
        })
        .catch(() => {
          setErrorMessage('Failed to update relationship');
        });
    },
    [setEdges, deleteRelationshipMutation, createRelationshipMutation, treeId, removeRelationship, addRelationship]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setSelectedPersonId(node.id);
      setDetailsOpen(true);
    },
    [setSelectedPersonId]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const relationship = relationships.find((r) => r.id === edge.id);
      if (relationship) {
        setSelectedRelationship(relationship);
        setEditRelationshipOpen(true);
      }
    },
    [relationships]
  );

  const handleRelayout = useCallback(() => {
    // Force re-layout and fit view
    const { nodes: layoutNodes, edges: layoutEdges } = buildFamilyTreeLayout(persons, relationships);
    const nodesWithCallbacks = layoutNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onHandleClick,
        onHover: onNodeHover,
        isDimmed: lineagePersonIds ? !lineagePersonIds.has(node.id) : false,
      },
    }));
    
    const edgesWithDimming = layoutEdges.map((edge) => ({
      ...edge,
      style: {
        ...edge.style,
        opacity: lineageEdgeIds ? (lineageEdgeIds.has(edge.id) ? 1 : 0.15) : 1,
        transition: 'opacity 0.2s ease',
      },
    }));
    
    setNodes(nodesWithCallbacks);
    setEdges(edgesWithDimming);
    
    // Fit view after layout with a small delay
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
    }, 50);
  }, [persons, relationships, setNodes, setEdges, reactFlowInstance, onHandleClick, onNodeHover, lineagePersonIds, lineageEdgeIds]);

  const handleAddPerson = async (personData: {
    firstName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth?: string;
    parentIds?: string[];
  }) => {
    try {
      const result = await createPersonMutation({
        variables: {
          input: {
            treeId,
            firstName: personData.firstName,
            lastName: personData.lastName,
            gender: personData.gender,
            dateOfBirth: personData.dateOfBirth,
          },
        },
      });

      if (result.data?.createPerson?.success) {
        const newPerson = result.data.createPerson.data;
        addPerson(newPerson);
        
        // Create parent relationships if parents were selected
        if (personData.parentIds && personData.parentIds.length > 0) {
          for (const parentId of personData.parentIds) {
            try {
              const relResult = await createRelationshipMutation({
                variables: {
                  input: {
                    treeId,
                    fromPersonId: parentId,
                    toPersonId: newPerson.id,
                    relationshipType: RelationshipType.PARENT,
                  },
                },
              });
              
              if (relResult.data?.createRelationship?.success) {
                addRelationship(relResult.data.createRelationship.data);
              }
            } catch (relErr) {
              console.error('Failed to create parent relationship:', relErr);
            }
          }
        }
        
        setSuccessMessage('Person added successfully');
      } else {
        setErrorMessage(result.data?.createPerson?.error || 'Failed to create person');
      }
      setAddPersonOpen(false);
    } catch (err) {
      console.error('Failed to create person:', err);
      setErrorMessage('Failed to create person');
    }
  };

  const handleAddRelationship = async (relationshipData: {
    fromPersonId: string;
    toPersonId: string;
    relationshipType: RelationshipType;
  }) => {
    try {
      const result = await createRelationshipMutation({
        variables: {
          input: {
            treeId,
            ...relationshipData,
          },
        },
      });

      if (result.data?.createRelationship?.success) {
        addRelationship(result.data.createRelationship.data);
      }
      setAddRelationshipOpen(false);
      setSuccessMessage('Relationship added successfully');
    } catch (err) {
      console.error('Failed to create relationship:', err);
      setErrorMessage('Failed to create relationship');
    }
  };

  const handleUpdateRelationship = async (data: {
    id: string;
    startDate?: string;
    endDate?: string;
    notes?: string;
  }) => {
    try {
      const result = await updateRelationshipMutation({
        variables: {
          input: data,
        },
      });

      if (result.data?.updateRelationship?.success) {
        // Update the relationship in the store
        const updatedRelationship = result.data.updateRelationship.data;
        updateRelationship(updatedRelationship);
        setSuccessMessage('Relationship updated successfully');
      } else {
        setErrorMessage(result.data?.updateRelationship?.error || 'Failed to update relationship');
      }
      setEditRelationshipOpen(false);
    } catch (err) {
      console.error('Failed to update relationship:', err);
      setErrorMessage('Failed to update relationship');
    }
  };

  // Handle adding a document to a relationship
  const handleAddDocument = async (input: AddDocumentInput) => {
    try {
      const result = await addDocumentMutation({
        variables: { input },
      });

      if (result.data?.addDocumentToRelationship?.success) {
        // Update the relationship in the store with the new document
        const updatedRelationship = result.data.addDocumentToRelationship.data;
        updateRelationship(updatedRelationship);
        setSelectedRelationship(updatedRelationship);
        setSuccessMessage('Document added successfully');
      } else {
        setErrorMessage(result.data?.addDocumentToRelationship?.error || 'Failed to add document');
        throw new Error(result.data?.addDocumentToRelationship?.error || 'Failed to add document');
      }
    } catch (err) {
      console.error('Failed to add document:', err);
      setErrorMessage('Failed to add document');
      throw err;
    }
  };

  // Handle removing a document from a relationship
  const handleRemoveDocument = async (relationshipId: string, documentId: string) => {
    try {
      const result = await removeDocumentMutation({
        variables: { relationshipId, documentId },
      });

      if (result.data?.removeDocumentFromRelationship?.success) {
        // Update the relationship in the store without the removed document
        const updatedRelationship = result.data.removeDocumentFromRelationship.data;
        updateRelationship(updatedRelationship);
        setSelectedRelationship(updatedRelationship);
        setSuccessMessage('Document removed successfully');
      } else {
        setErrorMessage(result.data?.removeDocumentFromRelationship?.error || 'Failed to remove document');
        throw new Error(result.data?.removeDocumentFromRelationship?.error || 'Failed to remove document');
      }
    } catch (err) {
      console.error('Failed to remove document:', err);
      setErrorMessage('Failed to remove document');
      throw err;
    }
  };

  // Handle adding a related person (from handle click)
  const handleAddRelatedPerson = async (personData: {
    firstName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth?: string;
    relationshipType: RelationshipType;
  }) => {
    if (!handleClickPerson) return;

    try {
      const existingPerson = handleClickPerson;

      // Create the new person
      const createResult = await createPersonMutation({
        variables: {
          input: {
            treeId,
            firstName: personData.firstName,
            lastName: personData.lastName,
            gender: personData.gender,
            dateOfBirth: personData.dateOfBirth,
          },
        },
      });

      if (!createResult.data?.createPerson?.success) {
        setErrorMessage(createResult.data?.createPerson?.error || 'Failed to create person');
        return;
      }

      const newPerson = createResult.data.createPerson.data;
      addPerson(newPerson);

      // Determine relationship direction based on handle position
      // PARENT relationship always goes from parent -> child
      let fromPersonId: string;
      let toPersonId: string;
      let relationshipType = personData.relationshipType;

      if (relationshipType === RelationshipType.PARENT) {
        if (handleClickPosition === 'top') {
          // Adding a parent above - new person is parent of existing person
          fromPersonId = newPerson.id;
          toPersonId = existingPerson.id;
        } else {
          // Adding a child below - existing person is parent of new person
          fromPersonId = existingPerson.id;
          toPersonId = newPerson.id;
        }
      } else {
        // Spouse - order doesn't matter semantically
        fromPersonId = existingPerson.id;
        toPersonId = newPerson.id;
      }

      // Create the relationship
      const relResult = await createRelationshipMutation({
        variables: {
          input: {
            treeId,
            fromPersonId,
            toPersonId,
            relationshipType,
          },
        },
      });

      const successLabel = handleClickPosition === 'bottom' ? 'Child' : 
        (relationshipType === RelationshipType.PARENT ? 'Parent' : 'Spouse');

      if (relResult.data?.createRelationship?.success) {
        addRelationship(relResult.data.createRelationship.data);
        setSuccessMessage(`${successLabel} added successfully`);
      } else {
        setErrorMessage(relResult.data?.createRelationship?.error || 'Failed to create relationship');
      }

      setAddRelatedPersonOpen(false);
      setHandleClickPerson(null);
      setHandleClickPosition(null);
    } catch (err) {
      console.error('Failed to add related person:', err);
      setErrorMessage('Failed to add related person');
    }
  };

  const handleDeletePerson = async (personId: string) => {
    try {
      const result = await deletePersonMutation({
        variables: { id: personId },
      });
      if (result.data?.deletePerson?.success) {
        removePerson(personId);
        setDetailsOpen(false);
        setSuccessMessage('Person deleted successfully');
      } else {
        setErrorMessage(result.data?.deletePerson?.error || 'Failed to delete person');
      }
    } catch (err) {
      console.error('Failed to delete person:', err);
      setErrorMessage(`Failed to delete person: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditPerson = async (personData: Partial<Person>) => {
    if (!personData.id) return;

    try {
      const result = await updatePersonMutation({
        variables: {
          input: {
            id: personData.id,
            firstName: personData.firstName,
            lastName: personData.lastName,
            maidenName: personData.maidenName,
            gender: personData.gender,
            dateOfBirth: personData.dateOfBirth,
            dateOfDeath: personData.dateOfDeath,
            placeOfBirth: personData.placeOfBirth,
            placeOfDeath: personData.placeOfDeath,
            occupation: personData.occupation,
            biography: personData.biography,
            photoUrl: personData.photoUrl,
          },
        },
      });

      if (result.data?.updatePerson?.success) {
        updatePerson(result.data.updatePerson.data);
        setSuccessMessage('Person updated successfully');
      } else {
        setErrorMessage(result.data?.updatePerson?.error || 'Failed to update person');
      }
    } catch (err) {
      console.error('Failed to update person:', err);
      setErrorMessage('Failed to update person');
    }
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    try {
      const result = await deleteRelationshipMutation({
        variables: { id: relationshipId },
      });
      if (result.data?.deleteRelationship?.success) {
        removeRelationship(relationshipId);
        setSuccessMessage('Relationship deleted successfully');
      } else {
        setErrorMessage(result.data?.deleteRelationship?.error || 'Failed to delete relationship');
      }
    } catch (err) {
      console.error('Failed to delete relationship:', err);
      setErrorMessage(`Failed to delete relationship: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const selectedPerson = useMemo(
    () => persons.find((p) => p.id === selectedPersonId),
    [persons, selectedPersonId]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Failed to load family tree: {error.message}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onReconnect={onReconnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const person = node.data?.person as Person;
            return person?.gender === Gender.MALE ? '#6366f1' : '#ec4899';
          }}
          maskColor="rgba(255, 255, 255, 0.8)"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'absolute', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Tooltip title="Auto-arrange tree" placement="left">
          <Fab color="secondary" size="medium" onClick={handleRelayout}>
            <AccountTreeIcon />
          </Fab>
        </Tooltip>
        <Tooltip title="Add Person" placement="left">
          <Fab color="primary" onClick={() => setAddPersonOpen(true)}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* Person Details Drawer */}
      <Drawer
        anchor="right"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 400 } }}
      >
        {selectedPerson && (
          <PersonDetailsPanel
            person={selectedPerson}
            relationships={relationships.filter(
              (r) => r.fromPersonId === selectedPerson.id || r.toPersonId === selectedPerson.id
            )}
            allPersons={persons}
            onClose={() => setDetailsOpen(false)}
            onDelete={() => handleDeletePerson(selectedPerson.id)}
            onEdit={() => setEditPersonOpen(true)}
            onAddRelationship={() => setAddRelationshipOpen(true)}
            onDeleteRelationship={handleDeleteRelationship}
          />
        )}
      </Drawer>

      {/* Add Person Dialog */}
      <AddPersonDialog
        open={addPersonOpen}
        onClose={() => setAddPersonOpen(false)}
        onSubmit={handleAddPerson}
        existingPersons={persons}
      />

      {/* Add Relationship Dialog */}
      <AddRelationshipDialog
        open={addRelationshipOpen}
        onClose={() => setAddRelationshipOpen(false)}
        onSubmit={handleAddRelationship}
        persons={persons}
        selectedPersonId={selectedPersonId}
      />

      {/* Add Related Person Dialog (from handle click) */}
      <AddRelatedPersonDialog
        open={addRelatedPersonOpen}
        onClose={() => {
          setAddRelatedPersonOpen(false);
          setHandleClickPerson(null);
          setHandleClickPosition(null);
        }}
        onSubmit={handleAddRelatedPerson}
        fromPerson={handleClickPerson}
        handlePosition={handleClickPosition}
      />

      {/* Edit Person Dialog */}
      <EditPersonDialog
        open={editPersonOpen}
        person={selectedPerson || null}
        onClose={() => setEditPersonOpen(false)}
        onSave={handleEditPerson}
      />

      {/* Edit Relationship Dialog */}
      <EditRelationshipDialog
        open={editRelationshipOpen}
        relationship={selectedRelationship}
        persons={persons}
        onClose={() => {
          setEditRelationshipOpen(false);
          setSelectedRelationship(null);
        }}
        onSave={handleUpdateRelationship}
        onAddDocument={handleAddDocument}
        onRemoveDocument={handleRemoveDocument}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Wrap with ReactFlowProvider to enable useReactFlow hook
export function TreeEditorPage() {
  return (
    <ReactFlowProvider>
      <TreeEditorContent />
    </ReactFlowProvider>
  );
}
