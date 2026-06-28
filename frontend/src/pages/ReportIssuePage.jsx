import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Send, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import FileUpload from "../components/report/FileUpload.jsx";
import LocationPicker from "../components/report/LocationPicker.jsx";
import AIPredictionPanel from "../components/report/AIPredictionPanel.jsx";
import api from "../utils/api.js";

const CATEGORIES = ["Roads", "Water", "Electricity", "Garbage", "Drainage", "Health", "Transport", "Public Safety"];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", category: "", description: "", priority: "normal" });
  const [files, setFiles] = useState([]);
  const [location, setLocation] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState("");

  // Simulate AI media analysis once a file is uploaded (replace with a real
  // classification endpoint when one is connected on the backend).
  useEffect(() => {
    if (files.length === 0) {
      setPrediction(null);
      return;
    }
    setAnalyzing(true);
    setPrediction(null);
    const timer = setTimeout(() => {
      const guess = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      setPrediction({
        category: guess,
        confidence: 84 + Math.floor(Math.random() * 14),
        department: `${guess} Department`,
      });
      setAnalyzing(false);
      setForm((f) => (f.category ? f : { ...f, category: guess }));
    }, 1600);
    return () => clearTimeout(timer);
  }, [files.length]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title || !form.category || !form.description) {
      setError("Please fill in the title, category, and description.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("category", form.category);
      payload.append("description", form.description);
      payload.append("priority", form.priority);
      if (location) {
        payload.append("lat", location.lat);
        payload.append("lng", location.lng);
      }
      files.forEach((f) => payload.append("media", f.file));

      const { data } = await api.post("/issues", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(data.issue);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't submit your report. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-3xl p-10 max-w-md text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={30} className="text-emerald-400" />
            </div>
            <h2 className="font-display font-bold text-2xl mb-2">Report submitted</h2>
            <p className="text-slate-400 text-sm mb-6">
              Your reference number is{" "}
              <span className="text-cyan-300 font-mono">{submitted.referenceId}</span>. You can
              track its progress any time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button to="/track" variant="secondary">
                Track this report
              </Button>
              <Button to="/">Back home</Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-6 pt-32 pb-20 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Report an issue</h1>
          <p className="text-slate-400 mb-10">
            Give us the details — our AI routes it to the right department automatically.
          </p>

          <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-7 sm:p-9">
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

            <Input
              label="Issue title"
              name="title"
              placeholder="e.g. Large pothole near bus stop"
              value={form.title}
              onChange={handleChange}
              required
            />

            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-colors [&>option]:bg-[#101826]"
              >
                <option value="" disabled>
                  Select a department
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-slate-400 mb-2">Description</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe what you see, when you noticed it, and anything else that might help."
                value={form.description}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
              />
            </div>

            <div className="mb-7">
              <label className="block text-xs font-medium text-slate-400 mb-2">Priority</label>
              <div className="flex gap-2.5">
                {["low", "normal", "urgent"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm({ ...form, priority: level })}
                    className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-colors ${
                      form.priority === level
                        ? "bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                        : "glass text-slate-400 hover:text-white"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-7">
              <FileUpload files={files} setFiles={setFiles} label="Photos or videos" />
              <AIPredictionPanel analyzing={analyzing} prediction={prediction} />
            </div>

            <div className="mb-8">
              <LocationPicker location={location} setLocation={setLocation} />
            </div>

            <Button type="submit" icon={Send} className="w-full py-3.5" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit report"}
            </Button>
          </form>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
