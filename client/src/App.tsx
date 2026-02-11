import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./lib/auth-context";

import AuthPage from "@/pages/auth";
import HomePage from "@/pages/home";
import LibraryPage from "@/pages/library";
import VoicePage from "@/pages/voice";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/auth" />} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/home" component={() => <ProtectedRoute component={HomePage} />} />
      <Route path="/library" component={() => <ProtectedRoute component={LibraryPage} />} />
      <Route path="/voice" component={() => <ProtectedRoute component={VoicePage} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
