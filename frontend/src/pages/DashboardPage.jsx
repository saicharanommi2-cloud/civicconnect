import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import StatCards from "../components/dashboard/StatCards.jsx";
import ActivityChart from "../components/dashboard/ActivityChart.jsx";
import CategoryDonut from "../components/dashboard/CategoryDonut.jsx";
import RecentComplaints from "../components/dashboard/RecentComplaints.jsx";
import Button from "../components/ui/Button.jsx";
import { FileText } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="flex"
    >
      <Sidebar />

      <main className="flex-1 px-6 sm:px-10 py-10 max-w-[1400px]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-slate-400 mt-1.5">
              Here's what's happening with your reports.
            </p>
          </div>
          <Button to="/report" icon={FileText}>
            Report Issue
          </Button>
        </div>

        <div className="space-y-6">
          <StatCards />

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityChart />
            </div>
            <CategoryDonut />
          </div>

          <RecentComplaints />
        </div>
      </main>
    </motion.div>
  );
}
