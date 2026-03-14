export interface AuthState {
  loading: boolean;
  error: string | null;
  isTokenValid: boolean;
  token: string | null;
  isAuthenticated: boolean;
  // facultatif : utile pour éviter des rechargements inutiles du user
  userLoaded?: boolean;
}

export const initialState: AuthState = {
  loading: false,
  error: null,
  isTokenValid: false,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null,
  isAuthenticated: false,
  userLoaded: false,
};
