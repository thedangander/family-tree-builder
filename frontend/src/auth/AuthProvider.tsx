import React from 'react';
import { AuthProvider as OidcAuthProvider, useAuth } from 'react-oidc-context';
import { oidcConfig } from './authConfig';
import { Box, CircularProgress, Typography, Button, Paper } from '@mui/material';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides OIDC authentication context to the app.
 * Handles the authentication callback and displays appropriate UI states.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const onSigninCallback = (): void => {
    // Remove the code and state from the URL after login
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <OidcAuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
      <AuthGuard>{children}</AuthGuard>
    </OidcAuthProvider>
  );
};

/**
 * Guard component that requires authentication before rendering children.
 * Shows loading state during auth, login button if not authenticated,
 * and error state if something goes wrong.
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  // Handle loading state
  if (auth.isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          Loading authentication...
        </Typography>
      </Box>
    );
  }

  // Handle error state
  if (auth.error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Authentication Error
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {auth.error.message}
          </Typography>
          <Button
            variant="contained"
            onClick={() => auth.signinRedirect()}
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  // Require authentication - redirect to login if not authenticated
  if (!auth.isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 3,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Family Tree
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please sign in to continue
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => auth.signinRedirect()}
          >
            Sign In
          </Button>
        </Paper>
      </Box>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default AuthProvider;
