import { useState, useRef, useEffect } from "react";
import { Lock, X } from "lucide-react";
import { checkPassword, setAuthenticated } from "../lib/adminAuth";

type Props = {
  onSuccess: () => void;
  onClose: () => void;
};

export default function PasswordModal({ onSuccess, onClose }: Props) {
  const [value, setValue]   = useState("");
  const [error, setError]   = useState(false);
  const [shake, setShake]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    if (checkPassword(value)) {
      setAuthenticated();
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setValue("");
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        onClick={onClose}
      />

      <div
        className={`relative glass-strong rounded-3xl w-full max-w-sm p-8 flex flex-col items-center gap-6 animate-scale-in ${shake ? "animate-shake" : ""}`}
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 glass-pill w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/60"
        >
          <X size={13} />
        </button>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
        >
          <Lock size={22} className="text-purple-400" />
        </div>

        <div className="text-center">
          <div className="text-base font-semibold text-white/85">Owner Access</div>
          <div className="text-xs text-white/35 mt-1">Enter password to add music</div>
        </div>

        <div className="w-full space-y-3">
          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={e => { setValue(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Password"
            className="w-full bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3 text-sm text-white/85 placeholder-white/25 outline-none focus:border-purple-500/50 transition-colors text-center tracking-widest"
            style={error ? { borderColor: "rgba(239,68,68,0.5)" } : {}}
          />

          {error && (
            <p className="text-xs text-red-400/70 text-center">Incorrect password — try again</p>
          )}

          <button
            onClick={submit}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
          >
            Unlock
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
        .animate-shake { animation: shake 0.45s ease; }
      `}</style>
    </div>
  );
}
