import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <DataProvider>
        <App />
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#141f1c',
              border: '1px solid rgba(245, 243, 239, 0.08)',
              color: '#f5f3ef',
            },
          }}
        />
      </DataProvider>
    </AuthProvider>
  </StrictMode>,
);
