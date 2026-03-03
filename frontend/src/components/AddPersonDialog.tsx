import { useState } from 'react';
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
  Autocomplete,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { Gender, Person } from '../types';

interface AddPersonDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth?: string;
    parentIds?: string[];
  }) => void;
  existingPersons?: Person[];
}

export function AddPersonDialog({ open, onClose, onSubmit, existingPersons = [] }: AddPersonDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.UNKNOWN);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedParents, setSelectedParents] = useState<Person[]>([]);

  const handleSubmit = () => {
    onSubmit({
      firstName,
      lastName,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      parentIds: selectedParents.length > 0 ? selectedParents.map(p => p.id) : undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setGender(Gender.UNKNOWN);
    setDateOfBirth('');
    setSelectedParents([]);
    onClose();
  };

  // Pre-fill last name from first selected parent
  const handleParentChange = (_: unknown, newValue: Person[]) => {
    // Limit to 2 parents
    const limitedParents = newValue.slice(0, 2);
    setSelectedParents(limitedParents);
    
    // Auto-fill last name from first parent if not already set
    if (limitedParents.length > 0 && !lastName) {
      setLastName(limitedParents[0].lastName);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Person</DialogTitle>
      <DialogContent>
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
          sx={{ mb: 2 }}
        />
        
        {existingPersons.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Parents (optional)
            </Typography>
            <Autocomplete
              multiple
              options={existingPersons}
              value={selectedParents}
              onChange={handleParentChange}
              getOptionLabel={(option) => option.fullName}
              getOptionDisabled={() => selectedParents.length >= 2}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder={selectedParents.length === 0 ? "Select up to 2 parents" : ""}
                  size="small"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.fullName}
                    size="small"
                    color={option.gender === Gender.MALE ? 'primary' : option.gender === Gender.FEMALE ? 'secondary' : 'default'}
                  />
                ))
              }
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2">{option.fullName}</Typography>
                    {option.dateOfBirth && (
                      <Typography variant="caption" color="text.secondary">
                        Born: {new Date(option.dateOfBirth).getFullYear()}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}
              noOptionsText="No persons available"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {selectedParents.length}/2 parents selected
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!firstName.trim() || !lastName.trim()}
        >
          Add Person
        </Button>
      </DialogActions>
    </Dialog>
  );
}
