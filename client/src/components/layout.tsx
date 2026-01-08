import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle2, 
  RefreshCw,
  Home, 
  Sparkles, 
  LayoutDashboard, 
  Calendar, 
  Moon, 
  Sun, 
  DollarSign, 
  TrendingUp,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Settings,
  FileText,
  Users,
  Search,
  ArrowUpRight,
  LogOut,
  Calculator,
  Gift,
  Receipt,
  Truck,
  Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";

function SidebarItem({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
  const [location] = useLocation();
  const active = location === href;

  return (
    <Link 
      href={href}
      className={cn(
        "h-10 flex items-center transition-all duration-300 mb-2 rounded-md mx-2 px-2.5",
        "justify-start",
        "w-10 group-hover:w-[calc(100%-1rem)]", 
        active ? "bg-black text-white" : "text-gray-400 hover:text-black hover:bg-gray-100"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="ml-3 whitespace-nowrap overflow-hidden opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 delay-75 text-sm font-medium">
        {label}
      </span>
    </Link>
  );
}

function SidebarSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="mb-6 w-full">
      <h3 className="px-4 text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation(); // Hook for logout navigation

  return (
    <div className="min-h-screen bg-background flex font-sans text-foreground">
      {/* Sidebar */}
      <aside className="group w-16 hover:w-64 flex-shrink-0 bg-white border-r border-border flex flex-col transition-all duration-500 ease-in-out py-6 sticky top-0 h-screen z-20 shadow-[1px_0_20px_rgba(0,0,0,0)] hover:shadow-[1px_0_40px_rgba(0,0,0,0.05)]">
        <div className="mb-8 flex items-center justify-center group-hover:justify-start group-hover:px-6 transition-all duration-300">
          <div className="h-8 w-8 bg-black text-white flex items-center justify-center font-serif font-bold text-lg flex-shrink-0 rounded-sm">
            M
          </div>
          <span className="ml-3 font-serif text-xl font-bold opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-500 delay-100">
            Munch Insights
          </span>
        </div>

        <nav className="flex-1 flex flex-col w-full overflow-y-auto overflow-x-hidden scrollbar-hide">
          <SidebarSection title="Accounting">
            <SidebarItem icon={Calculator} label="Accounting Home" href="/accounting/home" />
            <SidebarItem icon={FileText} label="PnL Release" href="/accounting/pnl" />
            <SidebarItem icon={Receipt} label="Journal Automations" href="/accounting/journals" />
            <SidebarItem icon={Gift} label="Bonus Release" href="/accounting/bonus" />
          </SidebarSection>

          <SidebarSection title="Insight">
            <SidebarItem icon={Home} label="Home" href="/insight/home" />
            <SidebarItem icon={Sparkles} label="Assistant" href="/insight/assistant" />
            <SidebarItem icon={LayoutDashboard} label="Dashboards" href="/insight/dashboards" />
          </SidebarSection>

          <SidebarSection title="Operate">
            <SidebarItem icon={Calendar} label="Schedule" href="/operate/schedule" />
            <SidebarItem icon={Moon} label="End of Day" href="/operate/end-of-day" />
            <SidebarItem icon={Sun} label="Start of Day" href="/operate/start-of-day" />
          </SidebarSection>

          <SidebarSection title="Motivate">
            <SidebarItem icon={DollarSign} label="Bonus" href="/motivate/bonus" />
            <SidebarItem icon={TrendingUp} label="Upsell" href="/motivate/upsell" />
          </SidebarSection>

          <SidebarSection title="Payroll">
            <SidebarItem icon={Sparkles} label="Onboarding" href="/payroll/onboarding" />
            <SidebarItem icon={Home} label="Home" href="/payroll/home" />
            <SidebarItem icon={FileText} label="Tax Center" href="/payroll/tax-center" />
          </SidebarSection>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 px-8 flex items-center justify-between bg-white border-b border-border sticky top-0 z-10">
           <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors outline-none group">
                   <div className="h-6 w-6 bg-gray-900 text-white rounded flex items-center justify-center text-xs font-serif font-bold">K</div>
                   <span className="font-medium text-foreground text-sm">KOQ LLC</span>
                   <ChevronsUpDown className="h-3 w-3 text-muted-foreground group-hover:text-black" />
                 </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="start" className="w-56">
                 <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Switch Organization</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem className="gap-2 cursor-pointer">
                   <div className="h-5 w-5 bg-gray-900 text-white rounded flex items-center justify-center text-[10px] font-serif font-bold">K</div>
                   <span className="font-medium">KOQ LLC</span>
                   <Check className="h-3 w-3 ml-auto" />
                 </DropdownMenuItem>
                 <DropdownMenuItem className="gap-2 cursor-pointer">
                   <div className="h-5 w-5 bg-gray-200 text-gray-500 rounded flex items-center justify-center text-[10px] font-serif font-bold">M</div>
                   <span className="font-medium">Munch Demo</span>
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>

             <div className="h-4 w-px bg-border" />

             <Popover>
               <PopoverTrigger asChild>
                 <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors group">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="font-medium text-foreground text-sm group-hover:text-black">Synced: 2/2</span>
                   <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-black" />
                 </button>
               </PopoverTrigger>
               <PopoverContent className="w-64 p-2" align="start">
                 <div className="space-y-1">
                   <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Integrations</div>

                   <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        <div className="flex flex-col">
                           <span className="text-sm font-medium">POS System</span>
                           <span className="text-[10px] text-muted-foreground">Toast API • Live</span>
                        </div>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                   </div>

                   <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                        <div className="flex flex-col">
                           <span className="text-sm font-medium">Accounting</span>
                           <span className="text-[10px] text-muted-foreground">QuickBooks • Synced 2m ago</span>
                        </div>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                   </div>
                 </div>

                 <div className="mt-2 pt-2 border-t border-border px-2">
                    <button className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground py-1.5 hover:bg-gray-50 rounded transition-colors">
                       <RefreshCw className="h-3 w-3" /> Sync Now
                    </button>
                 </div>
               </PopoverContent>
             </Popover>
           </div>

           <div className="flex items-center gap-6">
             <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help</button>
             <Link href="/settings">
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Settings</button>
             </Link>

             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 bg-secondary rounded-full flex items-center justify-center text-xs font-medium hover:bg-secondary/70 transition-colors outline-none" title="Profile">
                    JD
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                   <DropdownMenuLabel>My Account</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() => setLocation("/login")}
                   >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                   </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
           </div>
        </header>

        {children}
      </main>
    </div>
  );
}
