import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Relationship, RelationshipType, Person, DocumentType, AddDocumentInput } from '../types';

interface EditRelationshipDialogProps {
  open: boolean;
  relationship: Relationship | null;
  persons: Person[];
  onClose: () => void;
  onSave: (data: { id: string; startDate?: string; endDate?: string; notes?: string }) => void;
  onAddDocument?: (input: AddDocumentInput) => Promise<void>;
  onRemoveDocument?: (relationshipId: string, documentId: string) => Promise<void>;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.BIRTH_CERTIFICATE]: 'Birth Certificate',
  [DocumentType.DEATH_CERTIFICATE]: 'Death Certificate',
  [DocumentType.MARRIAGE_CERTIFICATE]: 'Marriage Certificate',
  [DocumentType.DIVORCE_CERTIFICATE]: 'Divorce Certificate',
  [DocumentType.PHOTO]: 'Photo',
  [DocumentType.LETTER]: 'Letter',
  [DocumentType.WILL_TESTAMENT]: 'Will / Testament',
  [DocumentType.MILITARY_RECORD]: 'Military Record',
  [DocumentType.IMMIGRATION_RECORD]: 'Immigration Record',
  [DocumentType.CENSUS]: 'Census Record',
  [DocumentType.OTHER]: 'Other',
};

export function EditRelationshipDialog({
  open,
  relationship,
  persons,
  onClose,
  onSave,
  onAddDocument,
  onRemoveDocument,
}: EditRelationshipDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Document form state
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocDescription, setNewDocDescription] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentType>(DocumentType.OTHER);
  const [newDocUrl, setNewDocUrl] = useState('');
  const [isAddingDocument, setIsAddingDocument] = useState(false);

  // Initialize form when relationship changes
  useEffect(() => {
    if (relationship && open) {
      setStartDate(relationship.startDate ? relationship.startDate.split('T')[0] : '');
      setEndDate(relationship.endDate ? relationship.endDate.split('T')[0] : '');
      setNotes(relationship.notes || '');
      // Reset document form
      setShowAddDocument(false);
      resetDocumentForm();
    }
  }, [relationship, open]);

  const resetDocumentForm = () => {
    setNewDocName('');
    setNewDocDescription('');
    setNewDocType(DocumentType.OTHER);
    setNewDocUrl('');
  };

  const handleSubmit = () => {
    if (!relationship) return;

    onSave({
      id: relationship.id,
      startDate: startDate,
      endDate: endDate,
      notes: notes,
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleAddDocument = async () => {
    if (!relationship || !onAddDocument || !newDocName || !newDocUrl) return;
    
    setIsAddingDocument(true);
    try {
      await onAddDocument({
        relationshipId: relationship.id,
        name: newDocName,
        description: newDocDescription || undefined,
        documentType: newDocType,
        fileUrl: newDocUrl,
      });
      resetDocumentForm();
      setShowAddDocument(false);
    } catch (error) {
      console.error('Failed to add document:', error);
    } finally {
      setIsAddingDocument(false);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    if (!relationship || !onRemoveDocument) return;
    
    try {
      await onRemoveDocument(relationship.id, documentId);
    } catch (error) {
      console.error('Failed to remove document:', error);
    }
  };

  const getRelationshipLabel = () => {
    if (!relationship) return '';
    switch (relationship.relationshipType) {
      case RelationshipType.SPOUSE:
        return 'Marriage';
      case RelationshipType.PARENT:
        return 'Parent-Child';
      default:
        return 'Relationship';
    }
  };

  const getPersonName = (personId: string) => {
    const person = persons.find((p) => p.id === personId);
    return person ? person.fullName : 'Unknown';
  };

  const getDateLabels = () => {
    if (!relationship) return { start: 'Start Date', end: 'End Date' };
    switch (relationship.relationshipType) {
      case RelationshipType.SPOUSE:
        return { start: 'Marriage Date', end: 'Divorce/End Date' };
      case RelationshipType.PARENT:
        return { start: 'Start Date', end: 'End Date' };
      default:
        return { start: 'Start Date', end: 'End Date' };
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const dateLabels = getDateLabels();
  const documents = relationship?.documents || [];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit {getRelationshipLabel()}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Relationship info */}
          {relationship && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Relationship between:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={getPersonName(relationship.fromPersonId)} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  {relationship.relationshipType === RelationshipType.SPOUSE ? '↔' : '→'}
                </Typography>
                <Chip 
                  label={getPersonName(relationship.toPersonId)} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>
          )}

          {/* Date fields */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label={dateLabels.start}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText={relationship?.relationshipType === RelationshipType.SPOUSE ? 'When they got married' : ''}
            />
            <TextField
              label={dateLabels.end}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText={relationship?.relationshipType === RelationshipType.SPOUSE ? 'Leave empty if still married' : ''}
            />
          </Box>

          {/* Notes field */}
          <TextField
            label="Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            placeholder={
              relationship?.relationshipType === RelationshipType.SPOUSE
                ? 'e.g., Wedding location, ceremony details...'
                : 'Additional notes about this relationship...'
            }
          />

          {/* Documents Section */}
          {onAddDocument && onRemoveDocument && (
            <>
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachFileIcon fontSize="small" />
                  Documents ({documents.length})
                </Typography>
                <Button
                  size="small"
                  startIcon={showAddDocument ? <ExpandLessIcon /> : <AddIcon />}
                  onClick={() => setShowAddDocument(!showAddDocument)}
                >
                  {showAddDocument ? 'Cancel' : 'Add Document'}
                </Button>
              </Box>

              {/* Add document form */}
              <Collapse in={showAddDocument}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Add New Document
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Document Name"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      size="small"
                      required
                      fullWidth
                    />
                    <FormControl size="small" fullWidth>
                      <InputLabel>Document Type</InputLabel>
                      <Select
                        value={newDocType}
                        label="Document Type"
                        onChange={(e) => setNewDocType(e.target.value as DocumentType)}
                      >
                        {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="File URL"
                      value={newDocUrl}
                      onChange={(e) => setNewDocUrl(e.target.value)}
                      size="small"
                      required
                      fullWidth
                      placeholder="https://..."
                      helperText="Link to the document file (e.g., cloud storage URL)"
                    />
                    <TextField
                      label="Description (optional)"
                      value={newDocDescription}
                      onChange={(e) => setNewDocDescription(e.target.value)}
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleAddDocument}
                      disabled={!newDocName || !newDocUrl || isAddingDocument}
                      startIcon={<AddIcon />}
                    >
                      {isAddingDocument ? 'Adding...' : 'Add Document'}
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {/* Documents list */}
              {documents.length > 0 ? (
                <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  {documents.map((doc, index) => (
                    <ListItem 
                      key={doc.id}
                      divider={index < documents.length - 1}
                      sx={{ pr: 10 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <DescriptionIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={doc.name}
                        secondary={
                          <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography component="span" variant="caption" color="text.secondary">
                              {DOCUMENT_TYPE_LABELS[doc.documentType]}
                              {doc.fileSize && ` • ${formatFileSize(doc.fileSize)}`}
                            </Typography>
                            {doc.description && (
                              <Typography component="span" variant="caption" color="text.secondary">
                                {doc.description}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mr: 0.5 }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveDocument(doc.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No documents attached yet.
                </Typography>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
