"use client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  type progressInfo = {
    step: string;
    percentage: number;
  };

  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState<{step: string, percentage: number}>();
  const [step, setStep] = useState<"identify" | "decrypting">("identify");
  const {login, isLoading, error} = useAuth();

  function getAvatarGradient(name: string) {
    if (!name) return "bg-vault-surface";
    const hash = name
      .split("")
      .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const hue = Math.abs(hash % 360);
    return `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${(hue + 40) % 360}, 70%, 50%))`;
  }

  async function handleLogin(e: React.SyntheticEvent) {
    e.preventDefault();
    // Salt retrieval
    setProgress({ step: "Tapping the server...", percentage: 10 });
    await new Promise((r) => setTimeout(r, 600));

    // Script key derivation
    setProgress({ step: "Deriving cryptographic keys...", percentage: 40 });
    await new Promise((r) => setTimeout(r, 1200));

    // Signing
    setProgress({ step: "Signing Proof...", percentage: 90 });
    await new Promise((r) => setTimeout(r, 600));

    await login(username, password);

    if(error){
        //failure
        setProgress({step: "something is not right...", percentage: 100});
        await new Promise((r) => setTimeout(r, 500));
    }else{
        // Success
        setProgress({ step: "Unlocking Secret Vault....", percentage: 100 });
        await new Promise((r) => setTimeout(r, 500));
        router.push("/vault");
    }

  }

  return (
    <>
      <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-vault-bg font-sans">
        {/* LEFT: Branding & Trust Signals */}
        <div className="hidden lg:flex flex-col justify-between p-24 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-accent-primary/10 blur-[100px] rounded-full animate-pulse-slow" />

          <div className="z-10 relative">
            <div className="flex items-center gap-3 text-accent-primary mb-8">
              <ShieldCheck className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight text-white">
                HAVEN
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-tight mb-6 text-white">
              Your Files.
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-primary to-white">
                Only You Can Read Them.
              </span>
            </h1>

            <p className="text-lg text-text-secondary max-w-md leading-relaxed">
              True Zero-Knowledge storage. We encrypt your files in your browser
              before they ever touch our servers. Even if we wanted to read your
              data, we couldn't.
            </p>
          </div>
          <div className="z-10 space-y-4 text-text-secondary text-sm">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>End-to-End Encryption (XChaCha20-Poly1305)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>Client-side Key Derivation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>Trustless Storage Provider</span>
            </div>
          </div>
        </div>
        {/* RIGHT: Login Form */}
        <div className="flex items-center justify-center p-8 relative">
          <div className="w-full max-w-105">
            <div className="bg-vault-surface/60 backdrop-blur-xl border border-vault-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col items-center mb-8">
                <div
                  className="w-20 h-20 rounded-full shadow-2xl mb-4 transition-all duration-500 ease-out flex items-center justify-center relative"
                  style={{ background: getAvatarGradient(username) }}
                >
                  {username ? (
                    <span className="text-2xl font-bold text-white/90 drop-shadow-md">
                      {username.slice(0, 2).toUpperCase()}
                    </span>
                  ) : (
                    <Lock className="w-8 h-8 text-white/50" />
                  )}
                  {username && (
                    <div className="absolute -bottom-1 -right-1 bg-vault-surface border border-vault-border rounded-full p-1.5 text-success">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-semibold text-white">
                  {step === "identify"
                    ? "Access Vault"
                    : `Welcome, ${username}`}
                </h2>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">
                    Identity
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (e.target.value.length > 0) setStep("identify");
                    }}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-white placeholder-text-placeholder focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                    placeholder="Username"
                    disabled={isLoading}
                  />
                </div>
                <div
                  className={`space-y-1.5 transition-all duration-500 ${username ? "opacity-100 translate-y-0" : "opacity-50 translate-y-2"}`}
                >
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">
                    Master Key
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-white placeholder-text-placeholder focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all"
                    placeholder="Password"
                    disabled={!username || isLoading}
                  />
                </div>
                {error &&(
                  <div className="p-3 rounded-lg bg-red-500/10 border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}
                {/* Progress / Submit */}
                {isLoading && progress ? (
                  <div className="bg-vault-bg rounded-lg p-4 border border-vault-border space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-between text-xs font-medium text-accent-primary">
                      <span>{progress.step}</span>
                      <span>{progress.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-vault-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-text-secondary flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-success" />
                      <span>Client-side encryption active</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={!username || !password}
                    className="group w-full bg-accent-primary hover:bg-opacity-90 text-white font-medium py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-primary/20"
                  >
                    <span>Unlock Vault</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </form>
              <div className="mt-6 text-center">
                <a
                  href="#"
                  className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                >
                  Lost your password? Your data is gone forever.
                </a>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-text-muted">
                Secured by{" "}
                <span className="text-text-secondary font-medium">
                  Haven Protocol
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
