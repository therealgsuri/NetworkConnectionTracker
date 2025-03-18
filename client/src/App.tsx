import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ContactList from "@/pages/contacts";
import ContactDetail from "@/pages/contacts/[id]";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/contacts" component={ContactList} />
          <Route path="/contacts/:id" component={ContactDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
