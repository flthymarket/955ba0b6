import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate(isAdmin ? "/admin" : "/account");
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a password reset link." });
        setMode("login");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name, phone },
          },
        });
        if (error) throw error;

        // Store name + phone on the profile so checkout can autofill
        if (data.user) {
          await supabase.from("profiles").update({ name, phone }).eq("user_id", data.user.id);
        }

        toast({
          title: "Account created",
          description: data.session
            ? "You're signed in."
            : "Check your email to verify your account before signing in.",
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "forgot" ? "Reset Password" : mode === "login" ? "Sign In" : "Create Account";
  const inputCls =
    "w-full border-b border-foreground bg-transparent py-3 text-[14px] outline-none placeholder:text-muted-foreground focus:border-foreground/50 transition-colors min-h-[48px]";

  return (
    <main className="pt-16 md:pt-24 pb-24 animate-fade-in">
      <div className="max-w-md mx-auto px-5">
        <h1 className="section-title mb-10">{title}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "signup" && (
            <>
              <div>
                <label className="editorial-heading text-[10px] text-muted-foreground block mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="Full name (for shipping labels)"
                  required
                />
              </div>
              <div>
                <label className="editorial-heading text-[10px] text-muted-foreground block mb-2">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="Phone number"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="editorial-heading text-[10px] text-muted-foreground block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="Email address"
              required
            />
          </div>

          {mode !== "forgot" && (
            <div>
              <label className="editorial-heading text-[10px] text-muted-foreground block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="Password"
                required
                minLength={6}
              />
            </div>
          )}

          {mode === "login" && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-3 group"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <span
                  className={`w-[18px] h-[18px] border flex items-center justify-center transition-all ${
                    rememberMe ? "bg-foreground border-foreground" : "border-foreground/60"
                  }`}
                >
                  {rememberMe && <Check className="w-3 h-3 text-background" />}
                </span>
                <span className="editorial-heading text-[10px] text-muted-foreground">Remember me</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="editorial-heading text-[10px] text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 nav-link min-h-[52px] disabled:opacity-50 hover:opacity-85 transition-opacity"
          >
            {loading ? "..." : mode === "forgot" ? "Send Reset Link" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-8 space-y-3">
          {mode === "forgot" ? (
            <button
              onClick={() => setMode("login")}
              className="editorial-heading text-[10px] text-muted-foreground hover:text-foreground"
            >
              ← Back to Sign In
            </button>
          ) : (
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="editorial-heading text-[10px] text-muted-foreground hover:text-foreground"
            >
              {mode === "login" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          )}
          <p className="pt-4">
            <Link to="/staff" className="editorial-heading text-[10px] text-muted-foreground hover:text-foreground underline">
              Staff Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Auth;
