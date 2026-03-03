import { Box, Typography, Button, Container, Card, CardContent, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GroupIcon from '@mui/icons-material/Group';
import ShareIcon from '@mui/icons-material/Share';

export function HomePage() {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <AccountTreeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h2" component="h1" gutterBottom>
            Build Your Family Tree
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Create, visualize, and share your family history with an interactive
            graph-based family tree editor.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              component={RouterLink}
              to="/trees"
              variant="contained"
              size="large"
              color="primary"
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="primary"
            >
              Learn More
            </Button>
          </Box>
        </Box>

        {/* Features Section */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <AccountTreeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Visual Graph Editor
                </Typography>
                <Typography color="text.secondary">
                  Drag and drop family members on an interactive canvas.
                  Visualize relationships with intuitive connections.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <GroupIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Rich Profiles
                </Typography>
                <Typography color="text.secondary">
                  Store detailed information about each family member including
                  photos, dates, places, and biographical notes.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <ShareIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Share & Collaborate
                </Typography>
                <Typography color="text.secondary">
                  Share your family tree with relatives. Collaborate together
                  to build a complete family history.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
