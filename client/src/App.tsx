import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/home";
import Settings from "@/pages/settings";
import GenericPage from "@/pages/generic";
import Assistant from "@/pages/assistant";
import Login from "@/pages/login";
import Layout from "@/components/layout";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

function AuthenticatedRoutes() {
  const [location] = useLocation();
  
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Switch location={location} key={location}>
          <Route path="/insight/home">
            <PageTransition><Dashboard /></PageTransition>
          </Route>
          <Route path="/insight/assistant">
             <PageTransition><Assistant /></PageTransition>
          </Route>
          <Route path="/insight/dashboards">
             <PageTransition><GenericPage title="Dashboards" /></PageTransition>
          </Route>
          
          <Route path="/operate/schedule">
             <PageTransition><GenericPage title="Schedule" /></PageTransition>
          </Route>
          <Route path="/operate/end-of-day">
             <PageTransition><GenericPage title="End of Day" /></PageTransition>
          </Route>
          <Route path="/operate/start-of-day">
             <PageTransition><GenericPage title="Start of Day" /></PageTransition>
          </Route>
          
          <Route path="/motivate/bonus">
             <PageTransition><GenericPage title="Bonus" /></PageTransition>
          </Route>
          <Route path="/motivate/upsell">
             <PageTransition><GenericPage title="Upsell" /></PageTransition>
          </Route>
          
          <Route path="/settings">
             <PageTransition><Settings /></PageTransition>
          </Route>

          <Route component={NotFound} />
        </Switch>
      </AnimatePresence>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/login" />} />
      <Route path="/login" component={Login} />
      
      {/* Catch-all for authenticated routes to wrap them in Layout */}
      <Route path="/:rest*" component={AuthenticatedRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
