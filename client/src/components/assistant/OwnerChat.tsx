import React, { useState, useEffect } from "react";
import { FileText, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ActionCard, availableActions } from "@/components/pnl/ActionCard";
import { renderMarkdown } from "@/lib/render-markdown";

interface OwnerChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: string[];
  report?: {
    id: string;
    title: string;
    content: string;
  };
}

interface OwnerChatProps {
  isOpen: boolean;
  onClose: () => void;
  triggerQuery?: string | null;
  onOpenReport?: (report: { id: string; title: string; content: string }) => void;
}

export function OwnerChat({
  isOpen,
  onClose,
  triggerQuery,
  onOpenReport,
}: OwnerChatProps) {
  const [messages, setMessages] = useState<OwnerChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [processedTrigger, setProcessedTrigger] = useState<string | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const cartTotal = cart.reduce((sum, id) => {
    const action = availableActions.find((a) => a.id === id);
    return sum + (action?.impact || 0);
  }, 0);

  const toggleCart = (actionId: string) => {
    setCart((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );
  };

  const applyChanges = () => {
    setShowConfetti(true);
    toast({
      title: "Changes Applied!",
      description: `${cart.length} action${
        cart.length > 1 ? "s" : ""
      } scheduled. Est. impact: +$${cartTotal.toLocaleString()}/mo`,
    });
    setTimeout(() => setShowConfetti(false), 3000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (triggerQuery && triggerQuery !== processedTrigger && isOpen) {
      handleSend(triggerQuery, true);
      setProcessedTrigger(triggerQuery);
    }
  }, [triggerQuery, isOpen]);

  const handleSend = async (text: string, isInstant: boolean = false) => {
    if (!text.trim()) return;

    const userMsg: OwnerChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    if (!isInstant) {
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 1500));
    }

    let responseText =
      "I can help with that! Here are some actions you can take:";
    let suggestedActions: string[] = [];

    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("food cost") ||
      lowerText.includes("pastry") ||
      lowerText.includes("chocolate") ||
      lowerText.includes("cogs") ||
      lowerText.includes("ingredients")
    ) {
      responseText =
        "I analyzed the **Pastry** category:\n\n\u2022 **White Chocolate**: $14.50 \u2192 $16.25 (+12%)\n\u2022 **Puff Pastry**: $38 \u2192 $41 (+8%)\n\nThese items caused $980 in variance. Here are actions you can add to your plan:";
      suggestedActions = ["review-pastry", "pastry-vendor"];
    } else if (
      lowerText.includes("labor") ||
      lowerText.includes("efficiency") ||
      lowerText.includes("scheduling")
    ) {
      responseText =
        "**Labor Analysis:**\n\nLabor % improved from 35% \u2192 32%!\n\n**Key Win**: Mid-shift cuts on Tue/Wed saved 40 hours.\n**Manager**: Sarah earned her efficiency bonus.\n\nHere are actions to lock in these wins:";
      suggestedActions = ["lock-scheduling", "bonus-sarah"];
    } else if (lowerText.includes("overtime")) {
      responseText =
        "**Overtime Breakdown:**\n\n\u2022 Kitchen Prep: 12 hours ($350 impact)\n\u2022 Cause: Late Sysco delivery on 10/14\n\nHere's how to prevent this next month:";
      suggestedActions = ["adjust-delivery"];
    } else if (lowerText.includes("sales") || lowerText.includes("tapas")) {
      responseText =
        "**Sales Insight:**\n\nWeekend Tapas sales are down 5%!\n\n**Top Item**: Matcha Lava Cake (+40 units)\n**Upsells**: 18% Coffee attach rate = $1,200 extra\n\nCapitalize on this momentum:";
      suggestedActions = ["promote-seasonal"];
    } else if (lowerText.includes("email")) {
      responseText =
        "I'll draft that email for you:\n\n---\n\n**Subject**: Great work on October!\n\nTeam,\n\nI'm thrilled to share that we beat our efficiency goals this month. Labor costs dropped 6% thanks to smart scheduling. Let's keep it up!\n\nBest,\nOwner\n\n---\n\n*Email ready to send via your preferred method.*";
      suggestedActions = [];
    } else {
      responseText =
        "Here are some suggested improvements based on your October report:";
      suggestedActions = ["review-pastry", "adjust-delivery", "lock-scheduling"];
    }

    const aiMsg: OwnerChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseText,
      actions: suggestedActions,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm">Munch Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Build your action plan
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Cart Summary - Sticky */}
      {cart.length > 0 && (
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
              {cart.length}
            </div>
            <span className="text-sm font-medium text-emerald-900">
              actions selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-emerald-700">
              +${cartTotal.toLocaleString()}/mo
            </span>
            <button
              onClick={applyChanges}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              Apply All
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30"
        ref={scrollRef}
      >
        {messages.length === 0 && (
          <div className="mt-4 px-2">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full text-xs text-gray-600 mb-4">
                <Sparkles className="h-3 w-3" />
                Powered by AI
              </div>
              <p className="text-sm text-gray-600">
                Ask me about your P&L or explore these insights:
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSend("Why did food costs go up?")}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all text-sm group"
              >
                <span className="font-medium text-gray-900">
                  Why did food costs go up?
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Analyze COGS variance &rarr; Get action items
                </span>
              </button>
              <button
                onClick={() =>
                  handleSend("Show me the labor efficiency wins")
                }
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all text-sm group"
              >
                <span className="font-medium text-gray-900">
                  Labor efficiency wins
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  See what's working &rarr; Lock it in
                </span>
              </button>
              <button
                onClick={() => handleSend("What caused the overtime?")}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all text-sm group"
              >
                <span className="font-medium text-gray-900">
                  What caused overtime?
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  Find root cause &rarr; Prevent next month
                </span>
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            <div
              className={cn(
                "flex gap-3",
                msg.role === "assistant" ? "" : "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1",
                  msg.role === "assistant"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {msg.role === "assistant" ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <div className="font-bold text-xs">You</div>
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] py-2 px-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-gray-200 text-gray-900 rounded-tr-none"
                    : "bg-transparent text-gray-900 px-0"
                )}
              >
                {msg.role === "assistant"
                  ? renderMarkdown(msg.content)
                  : msg.content}
              </div>
            </div>

            {/* Report Button */}
            {msg.role === "assistant" && msg.report && (
              <div className="ml-11 mt-1 mb-2">
                <button
                  onClick={() => onOpenReport?.(msg.report!)}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium border border-indigo-100 shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Expand Full Report
                </button>
              </div>
            )}

            {/* Action Cards */}
            {msg.role === "assistant" &&
              msg.actions &&
              msg.actions.length > 0 && (
                <div className="ml-11 space-y-2">
                  {msg.actions.map((actionId) => {
                    const action = availableActions.find(
                      (a) => a.id === actionId
                    );
                    if (!action) return null;
                    return (
                      <ActionCard
                        key={action.id}
                        action={action}
                        isInCart={cart.includes(action.id)}
                        onToggle={() => toggleCart(action.id)}
                      />
                    );
                  })}
                </div>
              )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="h-8 w-8 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5 mt-3 px-3 py-2 bg-gray-100 rounded-xl">
              <div
                className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="w-full py-3 pl-4 pr-12 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Confetti overlay */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="text-6xl animate-bounce">&#127881;</div>
        </div>
      )}
    </div>
  );
}
