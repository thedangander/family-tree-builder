import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import { Person, Relationship, Gender, RelationshipType } from '../types';

interface PersonDetailsPanelProps {
  person: Person;
  relationships: Relationship[];
  allPersons: Person[];
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onAddRelationship: () => void;
  onDeleteRelationship: (id: string) => void;
}

export function PersonDetailsPanel({
  person,
  relationships,
  allPersons,
  onClose,
  onDelete,
  onEdit,
  onAddRelationship,
  onDeleteRelationship,
}: PersonDetailsPanelProps) {
  const getPersonById = (id: string) => allPersons.find((p) => p.id === id);

  const getRelatedPerson = (rel: Relationship) => {
    const otherId = rel.fromPersonId === person.id ? rel.toPersonId : rel.fromPersonId;
    return getPersonById(otherId);
  };

  const formatRelationshipType = (type: RelationshipType) => {
    return type.replace(/_/g, ' ').toLowerCase();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Person Details</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {/* Profile Section */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={person.photoUrl || undefined}
              sx={{
                width: 96,
                height: 96,
                mx: 'auto',
                mb: 2,
                background:
                  person.gender === Gender.MALE
                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                    : person.gender === Gender.FEMALE
                    ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
                    : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
              }}
            >
              <PersonIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{
                position: 'absolute',
                bottom: 8,
                right: -4,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="h5" gutterBottom>
            {person.fullName}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={person.isAlive ? 'Living' : 'Deceased'}
              color={person.isAlive ? 'success' : 'default'}
              size="small"
            />
            {person.age !== undefined && person.age !== null && (
              <Chip
                label={`${person.age} years old`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Details Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {person.dateOfBirth && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Birth Date
                </Typography>
                <Typography variant="body2">
                  {new Date(person.dateOfBirth).toLocaleDateString()}
                  {person.placeOfBirth && ` • ${person.placeOfBirth}`}
                </Typography>
              </Box>
            )}
            {person.dateOfDeath && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Death Date
                </Typography>
                <Typography variant="body2">
                  {new Date(person.dateOfDeath).toLocaleDateString()}
                  {person.placeOfDeath && ` • ${person.placeOfDeath}`}
                </Typography>
              </Box>
            )}
            {person.age !== undefined && person.age !== null && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Age
                </Typography>
                <Typography variant="body2">{person.age} years</Typography>
              </Box>
            )}
            {person.occupation && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Occupation
                </Typography>
                <Typography variant="body2">{person.occupation}</Typography>
              </Box>
            )}
            {person.biography && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Biography
                </Typography>
                <Typography variant="body2">{person.biography}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Relationships Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Relationships
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={onAddRelationship}>
              Add
            </Button>
          </Box>
          {relationships.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No relationships defined
            </Typography>
          ) : (
            <List dense>
              {relationships.map((rel) => {
                const relatedPerson = getRelatedPerson(rel);
                return (
                  <ListItem key={rel.id}>
                    <ListItemText
                      primary={relatedPerson?.fullName || 'Unknown'}
                      secondary={formatRelationshipType(rel.relationshipType)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" size="small" onClick={() => onDeleteRelationship(rel.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Box>

      {/* Footer Actions */}
      <Divider />
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button color="primary" startIcon={<EditIcon />} onClick={onEdit}>
          Edit Person
        </Button>
        <Button color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
          Delete
        </Button>
      </Box>
    </Box>
  );
}
