import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Typography,
} from '@mui/material';
import { Person, RelationshipType } from '../types';

interface AddRelationshipDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    fromPersonId: string;
    toPersonId: string;
    relationshipType: RelationshipType;
  }) => void;
  persons: Person[];
  selectedPersonId: string | null;
}

const relationshipOptions: { value: RelationshipType; label: string; description: string }[] = [
  { value: RelationshipType.PARENT, label: 'Parent of', description: 'Selected person is a parent of...' },
  { value: RelationshipType.SPOUSE, label: 'Spouse of', description: 'Selected person is married to...' },
];

export function AddRelationshipDialog({
  open,
  onClose,
  onSubmit,
  persons,
  selectedPersonId,
}: AddRelationshipDialogProps) {
  const [toPerson, setToPerson] = useState<Person | null>(null);
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(RelationshipType.PARENT);

  const fromPerson = persons.find((p) => p.id === selectedPersonId);
  const availablePersons = persons.filter((p) => p.id !== selectedPersonId);

  const handleSubmit = () => {
    if (!selectedPersonId || !toPerson) return;

    onSubmit({
      fromPersonId: selectedPersonId,
      toPersonId: toPerson.id,
      relationshipType,
    });
    handleClose();
  };

  const handleClose = () => {
    setToPerson(null);
    setRelationshipType(RelationshipType.PARENT);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Relationship</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
          <InputLabel>Relationship Type</InputLabel>
          <Select
            value={relationshipType}
            label="Relationship Type"
            onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
          >
            {relationshipOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {fromPerson?.fullName} <strong>is {relationshipOptions.find(o => o.value === relationshipType)?.label.toLowerCase()}</strong>:
        </Typography>
        <Autocomplete
          options={availablePersons}
          getOptionLabel={(option) => option.fullName}
          value={toPerson}
          onChange={(_, newValue) => setToPerson(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Select person" />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!toPerson}
        >
          Add Relationship
        </Button>
      </DialogActions>
    </Dialog>
  );
}
