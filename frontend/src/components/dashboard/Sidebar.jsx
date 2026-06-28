import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Search,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import Logo from "../ui/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: FileText, label: "My Reports" },
  { icon: Search, label: "Track" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 glass border-r border-white/5 px-5 py-7">
      <Link to="/" className="mb-10 px-1">
        <Logo size={30} />
      </Link>

      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              item.active
                ? "bg-gradient-to-r from-cyan-400/15 to-violet-500/15 text-white border border-cyan-400/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon size={17} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-5">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name || "Citizen"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </aside>
  );
}
