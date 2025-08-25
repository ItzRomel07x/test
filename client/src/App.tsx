import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import ProductsPage from "@/pages/products-page";
import ResourcesPage from "@/pages/resources-page";
import ContactPage from "@/pages/contact-page";
import AdminPage from "@/pages/admin-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import FloatingChat from "@/components/floating-chat";
import LoadingScreen from "@/components/loading-screen";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/contact" component={ContactPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="dark min-h-screen bg-black text-white">
            {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
            <Toaster />
            <Router />
            <FloatingChat />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
