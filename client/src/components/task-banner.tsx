import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Priority = "critical" | "high" | "medium" | "low";

interface TaskStep {
  id: string;
  label: string;
  completed: boolean;
}

interface ActiveTask {
  id: string;
  title: string;
  priority: Priority;
  steps?: TaskStep[];
  workPage?: string;
}

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof AlertCircle }> = {
  critical: { label: "Critical", color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", icon: AlertCircle },
  high: { label: "High", color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", icon: AlertTriangle },
  medium: { label: "Medium", color: "text-yellow-700", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", icon: Clock },
  low: { label: "Low", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", icon: CheckCircle2 },
};

export default function TaskBanner() {
  const [location] = useLocation();
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [steps, setSteps] = useState<TaskStep[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("activeTask");
    if (stored) {
      try {
        const task = JSON.parse(stored);
        setActiveTask(task);
        setSteps(task.steps || []);
      } catch {
        localStorage.removeItem("activeTask");
      }
    }

    const handleStorage = () => {
      const stored = localStorage.getItem("activeTask");
      if (stored) {
        try {
          const task = JSON.parse(stored);
          setActiveTask(task);
          setSteps(task.steps || []);
        } catch {
          setActiveTask(null);
          setSteps([]);
        }
      } else {
        setActiveTask(null);
        setSteps([]);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleDismiss = () => {
    localStorage.removeItem("activeTask");
    setActiveTask(null);
  };

  const handleToggleStep = (stepId: string) => {
    const newSteps = steps.map(s => 
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    setSteps(newSteps);
    
    if (activeTask) {
      const updatedTask = { ...activeTask, steps: newSteps };
      localStorage.setItem("activeTask", JSON.stringify(updatedTask));
    }
  };

  const handleMarkComplete = () => {
    localStorage.removeItem("activeTask");
    setActiveTask(null);
  };

  if (!activeTask || location === "/work-queue") return null;

  const config = priorityConfig[activeTask.priority];
  const PriorityIcon = config.icon;
  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const allComplete = totalSteps > 0 && completedSteps === totalSteps;

  return (
    <div className={cn("border-b", config.bgColor, config.borderColor)}>
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/work-queue">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Pipeline
              </Button>
            </Link>
            
            <div className="h-4 w-px bg-border" />
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={cn("text-xs font-medium", config.color, config.bgColor, config.borderColor)}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
              <span className="font-medium text-sm">{activeTask.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {totalSteps > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{completedSteps}/{totalSteps} steps</span>
                  <div className="w-24">
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setExpanded(!expanded)}
                  className="gap-1"
                >
                  {expanded ? "Hide Steps" : "Show Steps"}
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            )}
            
            {allComplete && (
              <Button size="sm" onClick={handleMarkComplete} className="gap-2" data-testid="button-complete-task">
                <CheckCircle2 className="h-4 w-4" />
                Mark Complete
              </Button>
            )}
            
            <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8" data-testid="button-dismiss-banner">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {expanded && steps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-start gap-6">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  onClick={() => handleToggleStep(step.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-sm border cursor-pointer transition-all",
                    step.completed 
                      ? "bg-emerald-100 border-emerald-300 text-emerald-800" 
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                    step.completed ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"
                  )}>
                    {step.completed ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                  </div>
                  <span className={cn("text-sm", step.completed && "line-through")}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
