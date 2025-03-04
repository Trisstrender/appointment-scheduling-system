import { AuthAction, AuthActionTypes, AuthState } from './authTypes';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AuthActionTypes.AUTH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
      
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: {
          id: action.payload.userId,
          email: action.payload.email,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          role: action.payload.role,
          userType: action.payload.userType,
        },
        token: action.payload.accessToken,
        error: null,
      };
      
    case AuthActionTypes.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
      
    case AuthActionTypes.AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
      
    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
      
    case AuthActionTypes.CLEAR_AUTH_ERROR:
      return {
        ...state,
        error: null,
      };
      
    case AuthActionTypes.LOAD_USER:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: {
          id: action.payload.userId,
          email: action.payload.email,
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          role: action.payload.role,
          userType: action.payload.userType,
        },
        token: action.payload.accessToken,
      };
      
    default:
      return state;
  }
};

export default authReducer;