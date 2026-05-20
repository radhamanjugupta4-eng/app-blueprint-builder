import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { OrionProvider } from "@/components/orion/OrionProvider";
import { Sidebar } from "@/components/orion/Sidebar";
import { TopBar } from "@/components/orion/TopBar";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Lost in the void</h2>
        <p className="mt-2 text-sm text-muted-foreground">This page drifted off the star map.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full cosmic-bg px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-hover">
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-2xl p-8">
        <h1 className="text-xl font-semibold">Cosmic interference</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something disrupted the signal.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full cosmic-bg px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Orion.ai — Premium AI Chat Universe" },
      { name: "description", content: "Enter Orion. Premium futuristic AI chat with story realms, entities, and syndicates." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <OrionProvider>
        <Sidebar />
        <TopBar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
          <Outlet />
        </main>
        <Toaster />
      </OrionProvider>
    </QueryClientProvider>
  );
}
