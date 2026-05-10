import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextSetup';

export const useAuth = () => useContext(AuthContext);
