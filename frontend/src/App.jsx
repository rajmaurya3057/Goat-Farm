import { useRoutes } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return useRoutes(AppRoutes());
}
