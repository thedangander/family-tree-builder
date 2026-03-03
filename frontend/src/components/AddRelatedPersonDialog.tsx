import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Gender, RelationshipType, Person } from '../types';

export type HandlePosition = 'top' | 'bottom' | 'left' | 'right';

interface AddRelatedPersonDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth?: string;
    relationshipType: RelationshipType;
  }) => void;
  fromPerson: Person | null;
  handlePosition: HandlePosition | null;
}

function getDefaultRelationshipType(position: HandlePosition | null): RelationshipType {
  switch (position) {
    case 'top':
      return RelationshipType.PARENT; // Adding a parent above
    case 'bottom':
      return RelationshipType.PARENT; // Adding a child below (they become parent of you)
    case 'left':
    case 'right':
      return RelationshipType.SPOUSE; // Adding a spouse to the side
    default:
      return RelationshipType.SPOUSE;
  }
}

function getRelationshipLabel(type: RelationshipType, position: HandlePosition | null): string {
  switch (type) {
    case RelationshipType.PARENT:
      return position === 'bottom' ? 'Add Child' : 'Add Parent';
    case RelationshipType.SPOUSE:
      return 'Add Spouse';
    default:
      return 'Add Related Person';
  }
}

function getPositionDescription(position: HandlePosition | null): string {
  switch (position) {
    case 'top':
      return 'Adding a parent above';
    case 'bottom':
      return 'Adding a child below';
    case 'left':
    case 'right':
      return 'Adding a spouse beside';
    default:
      return '';
  }
}

export function AddRelatedPersonDialog({
  open,
  onClose,
  onSubmit,
  fromPerson,
  handlePosition,
}: AddRelatedPersonDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.UNKNOWN);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(
    getDefaultRelationshipType(handlePosition)
  );

  // Update relationship type when handle position changes
  useEffect(() => {
    setRelationshipType(getDefaultRelationshipType(handlePosition));
  }, [handlePosition]);

  // Pre-fill last name for child relationships (bottom handle)
  useEffect(() => {
    if (fromPerson && open) {
      if (handlePosition === 'bottom') {
        // Adding a child - they inherit the parent's last name
        setLastName(fromPerson.lastName);
      } else {
        setLastName(''); // Don't pre-fill for parent or spouse
      }
    }
  }, [fromPerson, handlePosition, open]);

  const handleSubmit = () => {
    onSubmit({
      firstName,
      lastName,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      relationshipType,
    });
    handleClose();
  };

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setGender(Gender.UNKNOWN);
    setDateOfBirth('');
    setRelationshipType(getDefaultRelationshipType(handlePosition));
    onClose();
  };

  const dialogTitle = getRelationshipLabel(relationshipType, handlePosition);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonAddIcon color="primary" />
        {dialogTitle}
      </DialogTitle>
      <DialogContent>
        {fromPerson && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {getPositionDescription(handlePosition)}
            </Typography>
            <Typography variant="body2">
              Related to: <strong>{fromPerson.fullName}</strong>
            </Typography>
          </Box>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Relationship</InputLabel>
          <Select
            value={relationshipType}
            label="Relationship"
            onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
          >
            <MenuItem value={RelationshipType.PARENT}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {handlePosition === 'bottom' ? 'Child' : 'Parent'}
                <Chip label={handlePosition === 'bottom' ? '↓' : '↑'} size="small" variant="outlined" />
              </Box>
            </MenuItem>
            <MenuItem value={RelationshipType.SPOUSE}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Spouse
                <Chip label="↔" size="small" variant="outlined" />
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          autoFocus
          margin="dense"
          label="First Name"
          fullWidth
          variant="outlined"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Last Name"
          fullWidth
          variant="outlined"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Gender</InputLabel>
          <Select
            value={gender}
            label="Gender"
            onChange={(e) => setGender(e.target.value as Gender)}
          >
            <MenuItem value={Gender.UNKNOWN}>Unknown</MenuItem>
            <MenuItem value={Gender.MALE}>Male</MenuItem>
            <MenuItem value={Gender.FEMALE}>Female</MenuItem>
            <MenuItem value={Gender.OTHER}>Other</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Date of Birth"
          type="date"
          fullWidth
          variant="outlined"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!firstName.trim() || !lastName.trim()}
          startIcon={<PersonAddIcon />}
        >
          Add {relationshipType.charAt(0) + relationshipType.slice(1).toLowerCase()}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
