import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, Eye, EyeOff, UserPlus, AlertCircle } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import api from "../utils/api.js";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register-request", form);
      navigate("/verify-otp", { state: { email: form.email, password: form.password } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start reporting issues in your neighborhood.">
      <form onSubmit={handleSubmit}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        <Input
          label="Full name"
          icon={User}
          name="name"
          placeholder="Jordan Patel"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email address"
          icon={Mail}
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Phone number"
          icon={Phone}
          type="tel"
          name="phone"
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-500 hover:text-slate-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />

        <Button type="submit" icon={UserPlus} className="w-full py-3.5 mt-2" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>

        <p className="mt-7 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
