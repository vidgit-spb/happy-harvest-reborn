import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TelegramWebApp } from '@telegram-mini-apps/sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc.ts';
import superjson from 'superjson';
import './i18n.ts';

// Initialize Telegram Mini App
TelegramWebApp.ready();
TelegramWebApp.expand();
TelegramWebApp.enableClosingConfirmation();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // optional
      headers() {
        return {
          'x-telegram-app-id': TelegramWebApp.initData || '',
        };
      },
    }),
  ],
  transformer: superjson,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
);
