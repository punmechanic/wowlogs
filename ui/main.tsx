import { createRoot } from 'react-dom/client';
import './globals.css';
import { RouterProvider } from 'react-router';
import { createBrowserRouter } from 'react-router-dom';
import routes from './routes';
import { installPlugins } from './charts/plugins';

installPlugins();

const root = document.getElementById('root');
const router = createBrowserRouter(routes);
createRoot(root!).render(<RouterProvider router={router} />);
