import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import { initTheme } from './stores/themeStore';
import { startAppUpdates } from './lib/appUpdates';
import { restoreUpdateCheckpoint } from './lib/updateCheckpoint';
import './index.css';

initTheme();

let recoveryFailed = false;
try {
    restoreUpdateCheckpoint();
} catch {
    recoveryFailed = true;
}
startAppUpdates();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60,
            retry: 1,
        },
    },
});

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        {recoveryFailed ? (
            <div
                role="alert"
                className="max-w-md mx-auto p-6 text-(--body-text)"
            >
                Your update recovery copy could not be opened. Your saved data
                has not been deleted. Close and reopen the app to try again.
            </div>
        ) : (
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        )}
    </StrictMode>,
);
