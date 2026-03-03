import { WebStorageStateStore, type UserManagerSettings } from 'oidc-client-ts';

// Get Keycloak configuration from environment variables
const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'familytree';
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'familytree-frontend';

export const oidcConfig: UserManagerSettings = {
  authority: `${keycloakUrl}/realms/${realm}`,
  client_id: clientId,
  redirect_uri: `${window.location.origin}/`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
  response_type: 'code',
  scope: 'openid profile email',
  
  // Use PKCE for security (required for public clients)
  // This is handled automatically by oidc-client-ts
  
  // Token refresh settings
  automaticSilentRenew: true,
  silentRequestTimeoutInSeconds: 30,
  
  // Store tokens in session storage for security
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  
  // Load user info from userinfo endpoint
  loadUserInfo: true,
  
  // Monitor session state
  monitorSession: true,
  
  // Filter protocol claims from profile
  filterProtocolClaims: true,
};

// Helper to get the Keycloak account management URL
export const getAccountUrl = (): string => {
  return `${keycloakUrl}/realms/${realm}/account`;
};

// Helper to get logout URL with redirect
export const getLogoutUrl = (): string => {
  const redirectUri = encodeURIComponent(window.location.origin);
  return `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout?post_logout_redirect_uri=${redirectUri}&client_id=${clientId}`;
};
