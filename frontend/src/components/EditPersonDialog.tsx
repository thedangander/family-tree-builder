import { useState, useEffect, useRef } from 'react';
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
  Box,
  Avatar,
  IconButton,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { Gender, Person } from '../types';
import { ImageCropper } from './ImageCropper';

interface EditPersonDialogProps {
  open: boolean;
  person: Person | null;
  onClose: () => void;
  onSave: (data: Partial<Person>) => void;
}

export function EditPersonDialog({
  open,
  person,
  onClose,
  onSave,
}: EditPersonDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [maidenName, setMaidenName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.UNKNOWN);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [placeOfDeath, setPlaceOfDeath] = useState('');
  const [occupation, setOccupation] = useState('');
  const [biography, setBiography] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Initialize form when person changes
  useEffect(() => {
    if (person && open) {
      setFirstName(person.firstName || '');
      setLastName(person.lastName || '');
      setMaidenName(person.maidenName || '');
      setGender(person.gender || Gender.UNKNOWN);
      setDateOfBirth(person.dateOfBirth ? person.dateOfBirth.split('T')[0] : '');
      setDateOfDeath(person.dateOfDeath ? person.dateOfDeath.split('T')[0] : '');
      setPlaceOfBirth(person.placeOfBirth || '');
      setPlaceOfDeath(person.placeOfDeath || '');
      setOccupation(person.occupation || '');
      setBiography(person.biography || '');
      setPhotoUrl(person.photoUrl || '');
    }
  }, [person, open]);

  const handleSubmit = () => {
    if (!person) return;

    // Send empty strings to clear fields (backend will convert to null)
    // Only omit fields we don't want to update at all
    onSave({
      id: person.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      maidenName: maidenName.trim(),
      gender,
      dateOfBirth: dateOfBirth || undefined, // dates need special handling
      dateOfDeath: dateOfDeath || undefined,
      placeOfBirth: placeOfBirth.trim(),
      placeOfDeath: placeOfDeath.trim(),
      occupation: occupation.trim(),
      biography: biography.trim(),
      photoUrl: photoUrl,
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleCropComplete = (croppedImage: string) => {
    setPhotoUrl(croppedImage);
    setSelectedImage(null);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
  };

  const getAvatarBackground = () => {
    switch (gender) {
      case Gender.MALE:
        return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
      case Gender.FEMALE:
        return 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)';
      default:
        return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Person</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* Photo Section */}
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={photoUrl || undefined}
                    sx={{
                      width: 150,
                      height: 150,
                      background: getAvatarBackground(),
                      border: '4px solid white',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 64 }} />
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                {photoUrl && (
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleRemovePhoto}
                    sx={{ mt: 1 }}
                  >
                    Remove Photo
                  </Button>
                )}
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  Click the camera icon to upload a photo
                </Typography>
              </Box>
            </Grid>

            {/* Basic Info Section */}
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="First Name"
                    fullWidth
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Last Name"
                    fullWidth
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Maiden Name"
                    fullWidth
                    value={maidenName}
                    onChange={(e) => setMaidenName(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
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
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Life Events
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Place of Birth"
                    fullWidth
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Date of Death"
                    type="date"
                    fullWidth
                    value={dateOfDeath}
                    onChange={(e) => setDateOfDeath(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Place of Death"
                    fullWidth
                    value={placeOfDeath}
                    onChange={(e) => setPlaceOfDeath(e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Occupation"
                    fullWidth
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Biography"
                    fullWidth
                    multiline
                    rows={3}
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!firstName.trim() || !lastName.trim()}
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Cropper Dialog */}
      {selectedImage && (
        <ImageCropper
          open={cropperOpen}
          image={selectedImage}
          onClose={() => {
            setCropperOpen(false);
            setSelectedImage(null);
          }}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
        />
      )}
    </>
  );
}
