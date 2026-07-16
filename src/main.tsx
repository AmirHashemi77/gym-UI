import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { GlobalLoadingSpinner } from './components/GlobalLoadingSpinner';
import { SuccessToasts } from './components/SuccessToasts';
import { AuthProvider } from './features/auth';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeSync({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'fa';
  }, []);
  return children;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeSync>
            <GlobalLoadingSpinner />
            <SuccessToasts />
            <App />
          </ThemeSync>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
