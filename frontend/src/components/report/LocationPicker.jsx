import { useState } from "react";
import { motion } from "framer-motion";
import { LocateFixed, MapPin, Loader2 } from "lucide-react";

/**
 * Captures the user's GPS coordinates via the browser Geolocation API and
 * shows them over a stylized map placeholder. Swap the placeholder div for
 * a real Google Maps / Mapbox embed when API keys are available.
 */
export default function LocationPicker({ location, setLocation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function detectLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported in this browser.");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        setError("Couldn't access your location. Check browser permissions.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-2">Location</label>

      <div className="relative rounded-2xl overflow-hidden glass h-56">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundColor: "#0c1220",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {location ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-cyan-400/40 animate-ping" />
                <MapPin size={32} className="text-cyan-400 relative z-10" fill="#22D3EE" />
              </div>
              <p className="mt-3 text-xs font-mono text-slate-300 glass rounded-full px-3 py-1">
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            </motion.div>
          ) : (
            <p className="text-sm text-slate-500">No location selected yet</p>
          )}
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-600">
          Map preview — connect a Maps API key for live tiles
        </div>
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      <button
        type="button"
        onClick={detectLocation}
        disabled={loading}
        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
        {loading ? "Detecting your location..." : "Use my current location"}
      </button>
    </div>
  );
}
