import { useAuth as useOidcAuth } from 'react-oidc-context';
import { getAccountUrl, getLogoutUrl } from './authConfig';

/**
 * Custom hook that provides authentication functionality.
 * Extends react-oidc-context's useAuth with additional helpers.
 */
export const useAuth = () => {
  const auth = useOidcAuth();

  return {
    // Core auth state
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // User information
    user: auth.user,
    userId: auth.user?.profile?.sub,
    username: auth.user?.profile?.preferred_username as string | undefined,
    email: auth.user?.profile?.email as string | undefined,
    name: auth.user?.profile?.name as string | undefined,
    
    // Tokens
    accessToken: auth.user?.access_token,
    idToken: auth.user?.id_token,
    
    // Check for roles (from Keycloak realm_access claim)
    hasRole: (role: string): boolean => {
      const realmAccess = auth.user?.profile?.realm_access as { roles?: string[] } | undefined;
      return realmAccess?.roles?.includes(role) ?? false;
    },
    
    isAdmin: (): boolean => {
      const realmAccess = auth.user?.profile?.realm_access as { roles?: string[] } | undefined;
      return realmAccess?.roles?.includes('admin') ?? false;
    },
    
    isTreeOwner: (): boolean => {
      const realmAccess = auth.user?.profile?.realm_access as { roles?: string[] } | undefined;
      return realmAccess?.roles?.includes('tree-owner') ?? realmAccess?.roles?.includes('admin') ?? false;
    },
    
    // Auth actions
    login: () => auth.signinRedirect(),
    logout: () => {
      // Use Keycloak's logout endpoint for proper session termination
      auth.removeUser();
      window.location.href = getLogoutUrl();
    },
    
    // Silent token refresh
    refreshToken: () => auth.signinSilent(),
    
    // Account management URL
    accountUrl: getAccountUrl(),
    
    // Raw auth object for advanced use cases
    rawAuth: auth,
  };
};

export type AuthState = ReturnType<typeof useAuth>;
