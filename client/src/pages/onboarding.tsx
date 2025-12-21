import React, { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  Store, 
  ArrowLeft, 
  Receipt, 
  CreditCard,
  Target,
  Users,
  Check,
  CheckCircle2,
  ChevronRight,
  Star,
  MapPin,
  Sparkles
} from "lucide-react";

type Step = "restaurant_info" | "analyzing" | "confirm_restaurant" | "pos_connect" | "accounting_connect" | "goals" | "team_invite";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>("restaurant_info");
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [posSystem, setPosSystem] = useState("");
  const [accountingSystem, setAccountingSystem] = useState("");
  const [biggestHeadache, setBiggestHeadache] = useState("");
  const [role, setRole] = useState("");
  const [mainFocus, setMainFocus] = useState("");
  const [secondaryFocus, setSecondaryFocus] = useState("");
  const [thirdFocus, setThirdFocus] = useState("");
  const [hasAccountant, setHasAccountant] = useState<boolean | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const nextStep = (next: Step) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentStep(next);
      setIsLoading(false);
    }, 600);
  };

  const handleFinish = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLocation("/insight/home");
    }, 1500);
  };

  const prevStep = () => {
    const steps: Step[] = ["restaurant_info", "analyzing", "confirm_restaurant", "goals", "pos_connect", "accounting_connect", "team_invite"];
    const currentIndex = steps.indexOf(currentStep);
    
    // Skip analyzing step when going back
    if (currentStep === "confirm_restaurant") {
      setCurrentStep("restaurant_info");
      return;
    }

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderStepIndicator = () => {
    // Only show dots for main steps
    const steps = ["restaurant_info", "goals", "pos_connect", "accounting_connect", "team_invite"];
    
    // Map intermediate steps to the correct progress
    let activeStep = currentStep;
    if (currentStep === "analyzing" || currentStep === "confirm_restaurant") {
      activeStep = "restaurant_info";
    }

    const currentIndex = steps.indexOf(activeStep as any);
    
    return (
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, idx) => (
          <div 
            key={step} 
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              idx <= currentIndex ? "w-8 bg-emerald-600" : "w-2 bg-gray-200"
            )} 
          />
        ))}
      </div>
    );
  };

  const handleRestaurantSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentStep("analyzing");
      setIsLoading(false);
      // Auto-advance after "analysis"
      setTimeout(() => {
        setCurrentStep("confirm_restaurant");
      }, 2500);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="h-16 px-8 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-10">
         <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#1a4731] text-white flex items-center justify-center font-serif font-bold text-xs rounded-sm">
               M
            </div>
            <span className="font-serif text-lg font-bold tracking-tight">Munch Insights</span>
         </div>
         <div className="text-sm text-muted-foreground">
            Onboarding
         </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl">
           {renderStepIndicator()}

           {/* --- Step 1: Restaurant Info --- */}
           {currentStep === "restaurant_info" && (
             <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                   <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Store className="h-5 w-5" />
                   </div>
                   <h2 className="text-2xl font-serif font-medium mb-2 text-center">Tell us about your restaurant</h2>
                   <p className="text-muted-foreground text-center">Let's get your workspace set up.</p>
                </div>
                
                <div className="space-y-4 mb-8">
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Address</label>
                      <input 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                        placeholder="123 Main St, Brooklyn, NY" 
                        autoFocus
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium">Restaurant Name</label>
                      <input 
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                        placeholder="e.g. Little Mo's Diner" 
                      />
                   </div>
                </div>

                <button 
                  onClick={handleRestaurantSubmit}
                  disabled={!restaurantName}
                  className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                   {isLoading ? "Saving..." : <>Continue <ArrowRight className="h-4 w-4" /></>}
                </button>
             </div>
           )}

           {/* --- Analyzing State --- */}
           {currentStep === "analyzing" && (
             <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center max-w-md w-full">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                     <Sparkles className="h-8 w-8 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-2xl font-serif font-medium mb-3">Analyzing your reviews...</h2>
                <p className="text-muted-foreground mb-6">We're scanning public data to understand what your customers love (and what they don't).</p>
                
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full animate-[progress_2s_ease-in-out_infinite]" style={{width: '70%'}}></div>
                </div>
                <p className="text-xs text-muted-foreground">Gathering insights from Google, Yelp, and TripAdvisor</p>
             </div>
           )}

           {/* --- Confirm Restaurant & Analysis --- */}
           {currentStep === "confirm_restaurant" && (
             <div className="bg-white rounded-xl border border-gray-200 p-0 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden w-full max-w-lg">
                <div className="h-32 bg-gray-100 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop" 
                    alt="Restaurant Interior" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-xl font-bold drop-shadow-md">{restaurantName || "Little Mo's Diner"}</h2>
                    <p className="text-sm opacity-90 drop-shadow-md flex items-center gap-1"><MapPin className="h-3 w-3" /> {address || "Brooklyn, NY"}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                       <span className="text-2xl font-bold text-gray-900">4.8</span>
                       <div className="flex text-amber-400">
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                          <Star className="h-4 w-4 fill-current" />
                       </div>
                       <span className="text-sm text-muted-foreground">(324 reviews)</span>
                    </div>
                    <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
                       Top Rated
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                     <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Review Analysis</h3>
                     
                     <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 flex gap-3">
                        <div className="mt-0.5 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></div>
                        <div>
                           <p className="text-sm font-medium text-gray-900">Brunch is a hit</p>
                           <p className="text-xs text-muted-foreground mt-0.5">"Customers consistently praise the avocado toast and bottomless mimosas deal on weekends."</p>
                        </div>
                     </div>

                     <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 flex gap-3">
                        <div className="mt-0.5 text-amber-600"><Users className="h-4 w-4" /></div>
                        <div>
                           <p className="text-sm font-medium text-gray-900">Wait times are an issue</p>
                           <p className="text-xs text-muted-foreground mt-0.5">"Several reviews mention 45+ minute waits even with reservations during peak hours."</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <button 
                       onClick={() => nextStep("goals")}
                       className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                     >
                        Yes, this is my restaurant <ArrowRight className="h-4 w-4" />
                     </button>
                     <button 
                       onClick={() => prevStep()}
                       className="w-full bg-white text-muted-foreground py-2.5 rounded-md text-sm hover:text-foreground transition-colors border border-gray-200 hover:border-gray-300"
                     >
                        No, search again
                     </button>
                  </div>
                </div>
             </div>
           )}

           {/* --- Step 2: POS Connection --- */}
           {currentStep === "pos_connect" && (
             <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 relative">
                   <button 
                     onClick={prevStep}
                     className="absolute -left-2 top-0 p-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full transition-colors"
                     title="Go back"
                   >
                      <ArrowLeft className="h-4 w-4" />
                   </button>
                   <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Receipt className="h-5 w-5" />
                   </div>
                   <h2 className="text-2xl font-serif font-medium mb-2 text-center">Connect your Point of Sale</h2>
                   <p className="text-muted-foreground text-center">This allows us to track sales and labor in real-time.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   {["Toast", "Square", "Clover", "Lightspeed"].map((pos) => (
                      <button 
                        key={pos}
                        onClick={() => setPosSystem(pos)}
                        className={cn(
                           "p-4 border rounded-lg text-left hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-between group",
                           posSystem === pos ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "border-gray-200"
                        )}
                      >
                         <span className="font-medium">{pos}</span>
                         {posSystem === pos && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </button>
                   ))}
                </div>

                <div className="space-y-3">
                   <button 
                     onClick={() => nextStep("accounting_connect")}
                     disabled={!posSystem}
                     className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                   >
                      {isLoading ? "Connecting..." : "Connect " + (posSystem || "POS")}
                   </button>
                   <button 
                     onClick={() => nextStep("accounting_connect")}
                     className="w-full bg-white text-muted-foreground py-2.5 rounded-md text-sm hover:text-foreground transition-colors"
                   >
                      Skip and use demo data
                   </button>
                </div>
             </div>
           )}

           {/* --- Step 3: Accounting Connection --- */}
           {currentStep === "accounting_connect" && (
             <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 relative">
                   <button 
                     onClick={prevStep}
                     className="absolute -left-2 top-0 p-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full transition-colors"
                     title="Go back"
                   >
                      <ArrowLeft className="h-4 w-4" />
                   </button>
                   <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <CreditCard className="h-5 w-5" />
                   </div>
                   <h2 className="text-2xl font-serif font-medium mb-2 text-center">Connect Accounting Software</h2>
                   <p className="text-muted-foreground text-center">Automate your P&L and expense tracking.</p>
                </div>

                <div className="space-y-3 mb-8">
                   <button 
                     onClick={() => setAccountingSystem("QBO")}
                     className={cn(
                        "w-full p-4 border rounded-lg text-left hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-between",
                        accountingSystem === "QBO" ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "border-gray-200"
                     )}
                   >
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 bg-[#2ca01c] rounded-md flex items-center justify-center text-white font-bold text-xs">qb</div>
                         <span className="font-medium">QuickBooks Online</span>
                      </div>
                      {accountingSystem === "QBO" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                   </button>
                   
                   <button 
                     onClick={() => setAccountingSystem("Xero")}
                     className={cn(
                        "w-full p-4 border rounded-lg text-left hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-between",
                        accountingSystem === "Xero" ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" : "border-gray-200"
                     )}
                   >
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 bg-[#13b5ea] rounded-md flex items-center justify-center text-white font-bold text-xs">X</div>
                         <span className="font-medium">Xero</span>
                      </div>
                      {accountingSystem === "Xero" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                   </button>
                </div>

                <div className="space-y-3">
                   <button 
                     onClick={() => nextStep("team_invite")}
                     disabled={!accountingSystem}
                     className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                   >
                      {isLoading ? "Connecting..." : "Connect " + (accountingSystem || "Software")}
                   </button>
                   <button 
                     onClick={() => nextStep("team_invite")}
                     className="w-full bg-white text-muted-foreground py-2.5 rounded-md text-sm hover:text-foreground transition-colors"
                   >
                      Skip and use demo data
                   </button>
                </div>
             </div>
           )}

           {/* --- Step 4: Goals & Customization --- */}
           {currentStep === "goals" && (
             <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 relative">
                   <button 
                     onClick={prevStep}
                     className="absolute -left-2 top-0 p-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full transition-colors"
                     title="Go back"
                   >
                      <ArrowLeft className="h-4 w-4" />
                   </button>
                   <div className="h-10 w-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Target className="h-5 w-5" />
                   </div>
                   <h2 className="text-2xl font-serif font-medium mb-2 text-center">Customize your experience</h2>
                   <p className="text-muted-foreground text-center">Help us tailor your dashboard to your needs.</p>
                </div>

                <div className="space-y-6 mb-8">
                   <div className="space-y-2">
                      <label className="text-sm font-medium">What is your biggest headache today?</label>
                      <textarea 
                        value={biggestHeadache}
                        onChange={(e) => setBiggestHeadache(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 h-20 resize-none" 
                        placeholder="e.g. Labor costs are out of control on weekends..." 
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-sm font-medium">What is your role?</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                      >
                         <option value="">Select a role...</option>
                         <option value="owner">Owner / Operator</option>
                         <option value="gm">General Manager</option>
                         <option value="manager">Manager</option>
                         <option value="accountant">Accountant / Controller</option>
                         <option value="chef">Chef / Kitchen Manager</option>
                         <option value="other">Other</option>
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-sm font-medium">Main Priority</label>
                      <div className="grid grid-cols-1 gap-2">
                         {["Increase Sales", "Control Labor", "Control COGS"].map((focus) => (
                            <button
                               key={focus}
                               onClick={() => setMainFocus(focus)}
                               className={cn(
                                  "px-3 py-2 text-sm border rounded-md text-left transition-colors",
                                  mainFocus === focus ? "bg-black text-white border-black" : "bg-white text-foreground border-gray-200 hover:border-gray-300"
                               )}
                            >
                               {focus}
                            </button>
                         ))}
                      </div>
                   </div>
                   
                   {(mainFocus) && (
                      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                         <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase">Secondary Focus</label>
                            <select 
                               className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                               value={secondaryFocus}
                               onChange={(e) => setSecondaryFocus(e.target.value)}
                            >
                               <option value="">Select...</option>
                               <option>Increase Sales</option>
                               <option>Control Labor</option>
                               <option>Control COGS</option>
                               <option>Improve Staff Retention</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase">Third Focus</label>
                            <select 
                               className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                               value={thirdFocus}
                               onChange={(e) => setThirdFocus(e.target.value)}
                            >
                               <option value="">Select...</option>
                               <option>Increase Sales</option>
                               <option>Control Labor</option>
                               <option>Control COGS</option>
                               <option>Improve Staff Retention</option>
                            </select>
                         </div>
                      </div>
                   )}
                </div>

                <button 
                  onClick={() => nextStep("pos_connect")}
                  className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                   Continue <ArrowRight className="h-4 w-4" />
                </button>
             </div>
           )}

           {/* --- Step 5: Team & Invites --- */}
           {currentStep === "team_invite" && (
             <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 relative">
                   <button 
                     onClick={prevStep}
                     className="absolute -left-2 top-0 p-2 text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full transition-colors"
                     title="Go back"
                   >
                      <ArrowLeft className="h-4 w-4" />
                   </button>
                   <div className="h-10 w-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Users className="h-5 w-5" />
                   </div>
                   <h2 className="text-2xl font-serif font-medium mb-2 text-center">Invite your Accounting Team</h2>
                   <p className="text-muted-foreground text-center">Collaborate seamlessly on your P&Ls.</p>
                </div>

                <div className="space-y-6 mb-8">
                   <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="font-medium text-sm mb-3">Do you work with an accounting team for monthly or quarterly PnLs?</p>
                      <div className="flex gap-4">
                         <button 
                           onClick={() => setHasAccountant(true)}
                           className={cn(
                              "flex-1 py-2 rounded-md text-sm font-medium border transition-colors",
                              hasAccountant === true ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:bg-gray-50"
                           )}
                         >
                            Yes
                         </button>
                         <button 
                           onClick={() => setHasAccountant(false)}
                           className={cn(
                              "flex-1 py-2 rounded-md text-sm font-medium border transition-colors",
                              hasAccountant === false ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:bg-gray-50"
                           )}
                         >
                            No
                         </button>
                      </div>
                   </div>

                   {hasAccountant && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                         <div className="space-y-2">
                            <label className="text-sm font-medium">Invite them to your workspace</label>
                            <input 
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                              placeholder="accountant@firm.com" 
                            />
                            <p className="text-xs text-muted-foreground">They'll receive an email invite to join your organization.</p>
                         </div>
                      </div>
                   )}
                </div>

                <div className="space-y-3">
                   <button 
                     onClick={handleFinish}
                     className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                   >
                      {isLoading ? (
                        <>
                           <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Finalizing Setup...
                        </>
                      ) : (
                         "Finish Setup"
                      )}
                   </button>
                   <button 
                     onClick={handleFinish}
                     className="w-full text-muted-foreground text-sm hover:text-foreground transition-colors"
                   >
                      Skip for now
                   </button>
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}