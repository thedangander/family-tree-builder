import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { GET_TREES_BY_OWNER, CREATE_TREE } from '../graphql/queries';
import { Tree, CreateTreeInput, MutationResult } from '../types';
import { useAuth } from '../auth';

export function TreeListPage() {
  const { userId } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [newTreeName, setNewTreeName] = useState('');
  const [newTreeDescription, setNewTreeDescription] = useState('');

  const { data, loading, error, refetch } = useQuery<{ treesByOwner: Tree[] }>(
    GET_TREES_BY_OWNER,
    {
      variables: { ownerId: userId },
      skip: !userId,
    }
  );

  const [createTree, { loading: creating }] = useMutation<
    { createTree: MutationResult<Tree> },
    { input: CreateTreeInput }
  >(CREATE_TREE);

  const handleCreateTree = async () => {
    if (!newTreeName.trim() || !userId) return;

    try {
      await createTree({
        variables: {
          input: {
            name: newTreeName,
            ownerId: userId,
            description: newTreeDescription || undefined,
            isPublic: false,
          },
        },
      });
      setOpenDialog(false);
      setNewTreeName('');
      setNewTreeDescription('');
      refetch();
    } catch (err) {
      console.error('Failed to create tree:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load trees: {error.message}</Alert>
      </Container>
    );
  }

  const trees = data?.treesByOwner || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Family Trees
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Tree
        </Button>
      </Box>

      {trees.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No family trees yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Create your first family tree to get started!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Create Your First Tree
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {trees.map((tree) => (
            <Grid item xs={12} sm={6} md={4} key={tree.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {tree.name}
                  </Typography>
                  {tree.description && (
                    <Typography color="text.secondary" variant="body2">
                      {tree.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Created: {new Date(tree.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={RouterLink}
                    to={`/tree/${tree.id}`}
                    size="small"
                    color="primary"
                  >
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Tree Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Family Tree</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tree Name"
            fullWidth
            variant="outlined"
            value={newTreeName}
            onChange={(e) => setNewTreeName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newTreeDescription}
            onChange={(e) => setNewTreeDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTree}
            variant="contained"
            disabled={!newTreeName.trim() || creating}
          >
            {creating ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
