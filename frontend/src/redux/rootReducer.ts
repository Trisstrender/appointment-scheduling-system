import { combineReducers } from 'redux';
import authReducer from './auth/authReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here as the application grows
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;