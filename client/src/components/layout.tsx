import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Sparkles, 
  LayoutDashboard, 
  Calendar, 
  Moon, 
  Sun, 
  DollarSign, 
  TrendingUp,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

function SidebarItem({ icon: Icon, label, href, onClick }: { icon: any, label: string, href?: string, onClick?: () => void }) {
  const [location] = useLocation();
  const active = href ? location === href : false;

  const content = (
    <div className={cn(
      "h-10 flex items-center transition-all duration-300 mb-2 rounded-md mx-2 px-2.5 cursor-pointer",
      "justify-start",
      "w-10 group-hover:w-[calc(100%-1rem)]", 
      active ? "bg-black text-white" : "text-gray-400 hover:text-black hover:bg-gray-100"
    )}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="ml-3 whitespace-nowrap overflow-hidden opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 delay-75 text-sm font-medium">
        {label}
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button onClick={onClick} className="w-full text-left">{content}</button>;
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
        </nav>

        {/* Footer Settings & Logout */}
        <div className="mt-auto pt-4 border-t border-border mx-2">
           <SidebarItem icon={Settings} label="Settings" href="/settings" />
           <SidebarItem 
             icon={LogOut} 
             label="Logout" 
             onClick={() => console.log("Logging out...")} 
           />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50/30">
        {children}
      </main>
    </div>
  );
}
