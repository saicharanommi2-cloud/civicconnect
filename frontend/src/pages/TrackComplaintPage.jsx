import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, AlertCircle } from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import Button from "../components/ui/Button.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import api from "../utils/api.js";

const STAGES = ["Submitted", "AI Verification", "Department Assigned", "In Progress", "Resolved"];

function stageIndex(status) {
  switch (status) {
    case "pending":
      return 1;
    case "in-progress":
      return 3;
    case "resolved":
      return 4;
    default:
      return 0;
  }
}

export default function TrackComplaintPage() {
  const [referenceId, setReferenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [issue, setIssue] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!referenceId.trim()) return;
    setError("");
    setLoading(true);
    setIssue(null);
    try {
      const { data } = await api.get(`/issues/${referenceId.trim()}`);
      setIssue(data.issue);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "No report found with that reference number."
          : "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const currentStage = issue ? stageIndex(issue.status) : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-6 pt-32 pb-20 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Track your complaint</h1>
          <p className="text-slate-400">Enter your reference number to see live status.</p>
        </motion.div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. CC-10234"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors"
            />
          </div>
          <Button type="submit" disabled={loading} className="px-7">
            {loading ? "Searching..." : "Track"}
          </Button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-6"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {issue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-3xl p-7 sm:p-9"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
                <div>
                  <p className="text-xs font-mono text-slate-500 mb-1">{issue.referenceId}</p>
                  <h2 className="font-display font-semibold text-2xl">{issue.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} /> {issue.category}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />{" "}
                      {new Date(issue.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <StatusBadge status={issue.status} />
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-8">{issue.description}</p>

              <div className="relative">
                <div className="absolute top-3 left-0 right-0 h-0.5 bg-white/10" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute top-3 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-400"
                />
                <div className="relative flex justify-between">
                  {STAGES.map((stage, i) => (
                    <div key={stage} className="flex flex-col items-center text-center w-20">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                          i <= currentStage
                            ? "bg-gradient-to-br from-cyan-400 to-violet-500 text-white"
                            : "bg-white/10 text-slate-500"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <p
                        className={`text-[11px] mt-2 leading-tight ${
                          i <= currentStage ? "text-slate-200" : "text-slate-500"
                        }`}
                      >
                        {stage}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}
