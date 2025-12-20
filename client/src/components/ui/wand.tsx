import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function Wand() {
  return (
    <div className="relative h-6 w-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center text-emerald-600"
      >
        <Sparkles className="h-5 w-5" />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-0 bg-emerald-100 rounded-full opacity-50 z-[-1]"
      />
    </div>
  );
}
