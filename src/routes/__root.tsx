import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Header } from '@/components/layout';

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout(): React.ReactElement {
    return (
        <div className="min-h-screen bg-slate-900">
            <Header />
            <main className="py-6">
                <Outlet />
            </main>
        </div>
    );
}
