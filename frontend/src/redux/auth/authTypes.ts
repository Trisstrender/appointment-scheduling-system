export enum AuthActionTypes {
  AUTH_REQUEST = 'AUTH_REQUEST',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  LOGOUT = 'LOGOUT',
  CLEAR_AUTH_ERROR = 'CLEAR_AUTH_ERROR',
  LOAD_USER = 'LOAD_USER',
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  userType: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthRequestAction {
  type: AuthActionTypes.AUTH_REQUEST;
}

interface LoginSuccessAction {
  type: AuthActionTypes.LOGIN_SUCCESS;
  payload: {
    accessToken: string;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    userType: string;
  };
}

interface RegisterSuccessAction {
  type: AuthActionTypes.REGISTER_SUCCESS;
  payload: {
    message: string;
  };
}

interface AuthFailureAction {
  type: AuthActionTypes.AUTH_FAILURE;
  payload: string;
}

interface LogoutAction {
  type: AuthActionTypes.LOGOUT;
}

interface ClearAuthErrorAction {
  type: AuthActionTypes.CLEAR_AUTH_ERROR;
}

interface LoadUserAction {
  type: AuthActionTypes.LOAD_USER;
  payload: {
    accessToken: string;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    userType: string;
  };
}

export type AuthAction =
  | AuthRequestAction
  | LoginSuccessAction
  | RegisterSuccessAction
  | AuthFailureAction
  | LogoutAction
  | ClearAuthErrorAction
  | LoadUserAction;