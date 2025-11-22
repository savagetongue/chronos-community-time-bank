import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { MainLayout } from '@/components/layout/main-layout';
import { LandingPage } from '@/pages/landing-page';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import { DashboardHome } from '@/pages/dashboard/dashboard-home';
import { ExplorePage } from '@/pages/marketplace/explore-page';
import { TaskCreate } from '@/pages/marketplace/task-create';
import { TaskDetail } from '@/pages/marketplace/task-detail';
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});
const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/dashboard",
        element: <DashboardHome />,
      },
      {
        path: "/explore",
        element: <ExplorePage />,
      },
      {
        path: "/create-task",
        element: <TaskCreate />,
      },
      {
        path: "/tasks/:id",
        element: <TaskDetail />,
      },
      {
        path: "/about",
        element: <div className="p-12 text-center">About Page (Coming Soon)</div>,
      },
      {
        path: "/profile",
        element: <div className="p-12 text-center">Profile Settings (Coming Soon)</div>,
      }
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)