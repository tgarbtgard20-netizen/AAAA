import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './styles/main.css';

// In development, ensure no rogue service worker intercepts Vite dev requests
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);

