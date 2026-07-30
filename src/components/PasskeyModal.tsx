"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Fingerprint, KeyRound, Loader2, X } from "lucide-react";
import { startAuthentication, startRegistration, type PublicKeyCredentialCreationOptionsJSON, type PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";

type Mode = "signin" | "create";

export function PasskeyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const post = async (url: string, body: unknown) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: { error?: string } | null = null;
    try {
      data = text ? JSON.parse(text) as { error?: string } : null;
    } catch {
      // A deployment error can return an empty or non-JSON response.
    }
    if (!res.ok) {
      throw new Error(data?.error ?? `Authentication service failed (${res.status}). Check the Neon database migration.`);
    }
    if (!data) throw new Error("Authentication service returned an empty response");
    return data as Record<string, unknown>;
  };

  const submit = async () => {
    if (!username.trim()) {
      setError("Enter a workspace name first");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (mode === "create") {
        const options = await post("/api/auth/register/options", { username });
        const response = await startRegistration({ optionsJSON: options as unknown as PublicKeyCredentialCreationOptionsJSON });
        await post("/api/auth/register/verify", { username, response });
      } else {
        const options = await post("/api/auth/login/options", { username });
        const response = await startAuthentication({ optionsJSON: options as unknown as PublicKeyCredentialRequestOptionsJSON });
        await post("/api/auth/login/verify", { response });
      }
      window.location.href = "/dashboard";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Passkey failed";
      setError(message.includes("NotAllowed") ? "Passkey prompt was dismissed" : message);
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(30,50,90,0.25)] backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-white/40 p-8 shadow-xl"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 text-[rgba(30,50,90,0.5)] hover:text-[rgba(30,50,90,0.9)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-[rgba(30,50,90,0.06)] w-14 h-14 rounded-full flex items-center justify-center border border-[rgba(30,50,90,0.1)] mb-5">
              <Fingerprint className="w-7 h-7 text-[rgba(30,50,90,0.8)]" />
            </div>

            <h2 className="text-[28px] font-normal text-[#5E6470] tracking-tight leading-tight mb-1">
              {mode === "create" ? "Create your workspace" : "Sign in to Topos"}
            </h2>
            <p className="text-sm text-[#5E6470] opacity-70 mb-6">
              {mode === "create"
                ? "Your device secures the workspace with a passkey. No password to remember."
                : "Use the passkey stored on this device to unlock your rooms."}
            </p>

            <label className="block text-[12px] uppercase tracking-wider text-[rgba(30,50,90,0.6)] mb-2">
              Workspace name
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !busy && submit()}
              placeholder="studio-north"
              autoFocus
              className="w-full rounded-full bg-white/70 border border-[rgba(30,50,90,0.15)] px-5 py-3 text-[15px] text-[rgba(30,50,90,0.95)] placeholder:text-[rgba(30,50,90,0.35)] outline-none focus:border-[rgba(30,50,90,0.4)] transition-colors"
            />

            {error && <p className="mt-3 text-[13px] text-[#b4443a]">{error}</p>}

            <motion.button
              whileHover={{ scale: busy ? 1 : 1.02 }}
              whileTap={{ scale: busy ? 1 : 0.98 }}
              onClick={submit}
              disabled={busy}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-[rgba(30,50,90,0.9)] text-white rounded-full py-3.5 hover:bg-[rgba(30,50,90,1)] transition-colors disabled:opacity-70"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span className="text-sm font-normal">
                {busy ? "Waiting for your device…" : mode === "create" ? "Create passkey" : "Continue with passkey"}
              </span>
            </motion.button>

            <button
              onClick={() => { setMode(mode === "create" ? "signin" : "create"); setError(null); }}
              className="mt-4 w-full text-[13px] text-[rgba(30,50,90,0.6)] hover:text-[rgba(30,50,90,0.9)] transition-colors"
            >
              {mode === "create" ? "Already have a passkey? Sign in" : "New here? Create a workspace"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
