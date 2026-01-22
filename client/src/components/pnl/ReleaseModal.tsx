import { useState } from "react";
import { Calendar, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReleaseData {
  period: string;
  headline: string;
  insights: Array<{
    id: string;
    text: string;
    tag: string;
  }>;
}

export interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReleaseData;
  onConfirm: () => void;
}

export function ReleaseModal({ isOpen, onClose, data, onConfirm }: ReleaseModalProps) {
  const [message, setMessage] = useState("Here is your P&L report for the period. Highlights included below.");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full h-[80vh] flex overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Left Col: Settings */}
        <div className="w-1/2 p-8 border-r border-gray-200 flex flex-col">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-medium mb-2">Finalize Release</h2>
            <p className="text-muted-foreground text-sm">Review the notification message before sending to the owner.</p>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Schedule Send At</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-black focus:border-black outline-none"
                  />
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-black focus:border-black outline-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {scheduleDate && scheduleTime
                  ? `Scheduled for ${new Date(scheduleDate).toLocaleDateString()} at ${scheduleTime}`
                  : "Leave blank to send immediately"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Notification Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg focus:ring-black focus:border-black p-3 min-h-[120px] shadow-sm"
                placeholder="Add a personal message..."
              />
              <p className="text-xs text-muted-foreground mt-2">This message will appear in the email body and push notification.</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {scheduleDate && scheduleTime ? (
                <>Schedule Release <Calendar className="h-3 w-3" /></>
              ) : (
                <>Send & Release <Send className="h-3 w-3" /></>
              )}
            </button>
          </div>
        </div>

        {/* Right Col: Preview */}
        <div className="w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-white/80 px-2 py-1 rounded text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            Live Preview
          </div>

          {/* Email Card Preview */}
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden border border-gray-200 transform scale-95 origin-center">
            {/* Email Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-white text-black rounded-full flex items-center justify-center font-serif font-bold text-xs">M</div>
                <span className="font-medium text-sm">Munch Insights</span>
              </div>
              <span className="text-xs text-gray-400">Now</span>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-serif font-medium text-gray-900 mb-1">P&L Ready: {data.period}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 mb-4">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Executive Summary</div>
                <p className="text-sm font-medium text-gray-900 leading-snug mb-3">{data.headline}</p>

                <div className="space-y-2">
                  {data.insights.slice(0, 2).map((insight) => (
                    <div key={insight.id} className="flex gap-2 items-start">
                      <div className={cn(
                        "mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0",
                        insight.tag === "Positive" ? "bg-emerald-500" :
                        insight.tag === "Negative" ? "bg-red-500" : "bg-gray-400"
                      )} />
                      <p className="text-xs text-gray-600 leading-snug line-clamp-2">{insight.text}</p>
                    </div>
                  ))}
                  {data.insights.length > 2 && (
                    <p className="text-[10px] text-muted-foreground pl-3.5">+ {data.insights.length - 2} more insights</p>
                  )}
                </div>
              </div>

              <button className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium">
                View Full Report
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
