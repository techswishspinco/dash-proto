import React, { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setLocation("/onboarding");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-stretch font-sans bg-gray-50">
      
      {/* Left Panel - Brand & Value Prop */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#1a4731] text-white p-12 relative overflow-hidden">
        {/* Background Texture/Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-8 w-8 bg-white text-[#1a4731] flex items-center justify-center font-serif font-bold text-lg rounded-sm">
               M
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">Munch Insights</span>
          </div>

          <h1 className="font-serif text-5xl leading-[1.15] font-medium mb-8 max-w-lg">
            Restaurant management software built by operators, for operators.
          </h1>

          <p className="text-emerald-100/80 text-lg leading-relaxed max-w-md mb-8">
            Run payroll, manage inventory, and automate accounting all in a single platform.
          </p>
          
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-sm text-emerald-100/70">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Real-time labor tracking</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-emerald-100/70">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Automated supplier invoices</span>
             </div>
             <div className="flex items-center gap-3 text-sm text-emerald-100/70">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Gamified staff performance</span>
             </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-emerald-100/60">
          We're designed to help your restaurants scale through rewarding your best employees.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-[420px] space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Login</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your dashboard</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Work email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] transition-all"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#1a4731] text-white h-10 rounded-md font-medium hover:bg-[#143625] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Continue with email"
                )}
              </button>
            </form>

            <div className="relative">
               <div className="absolute inset-0 flex items-center">
                 <span className="w-full border-t border-gray-200" />
               </div>
               <div className="relative flex justify-center text-xs uppercase">
                 <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
               </div>
            </div>

            <div className="space-y-3">
               <button className="w-full bg-white border border-gray-200 text-foreground h-10 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center justify-between px-4 group">
                  <div className="flex items-center gap-3">
                     <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                     <span>Continue with Google</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
               </button>
               
               <button className="w-full bg-white border border-gray-200 text-foreground h-10 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center justify-between px-4 group">
                  <div className="flex items-center gap-3">
                     <img src="https://www.svgrepo.com/show/452263/microsoft.svg" alt="Microsoft" className="h-5 w-5" />
                     <span>Continue with Microsoft</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
               </button>
            </div>

            <div className="pt-2">
               <button className="text-xs text-muted-foreground hover:text-[#1a4731] hover:underline transition-colors">
                  Show enterprise options
               </button>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
             Need help? <a href="#" className="underline hover:text-foreground">Contact support</a>
          </div>
        </div>
      </div>
    </div>
  );
}