import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppErrorBoundary from './components/AppErrorBoundary';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fontsource-variable/manrope';
import '@fontsource-variable/newsreader';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
