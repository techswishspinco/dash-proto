import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/home";
import Dashboards from "@/pages/dashboards";
import Settings from "@/pages/settings";
import GenericPage from "@/pages/generic";
import Assistant from "@/pages/assistant";
import Login from "@/pages/login";
import Onboarding from "@/pages/onboarding";
import Journals from "@/pages/journals";
import PnlRelease from "@/pages/pnl-release";

import BonusRelease from "@/pages/bonus-release";

function Router() {
  return (
    <Switch>
      {/* Redirect root to the main dashboard view */}
      <Route path="/" component={() => <Redirect to="/login" />} />
      <Route path="/login" component={Login} />
      <Route path="/onboarding" component={Onboarding} />
      
      {/* Accounting Module */}
      <Route path="/accounting/home" component={() => <GenericPage title="Accounting Home" />} />
      <Route path="/accounting/journals" component={Journals} />
      <Route path="/accounting/pnl" component={PnlRelease} />
      <Route path="/finance/pnl-release" component={PnlRelease} />
      <Route path="/accounting/bonus" component={BonusRelease} />

      {/* Insight Module */}
      <Route path="/insight/home" component={Dashboard} />
      <Route path="/insight/assistant" component={Assistant} />
      <Route path="/insight/dashboards" component={Dashboards} />
      
      {/* Operate Module */}
      <Route path="/operate/schedule" component={() => <GenericPage title="Schedule" />} />
      <Route path="/operate/end-of-day" component={() => <GenericPage title="End of Day" />} />
      <Route path="/operate/start-of-day" component={() => <GenericPage title="Start of Day" />} />
      
      {/* Motivate Module */}
      <Route path="/motivate/bonus" component={() => <GenericPage title="Bonus" />} />
      <Route path="/motivate/upsell" component={() => <GenericPage title="Upsell" />} />
      
      {/* Settings / Profile */}
      <Route path="/settings" component={Settings} />

      <Route component={NotFound} />
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
