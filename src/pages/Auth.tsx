import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a password reset link." });
        setIsForgotPassword(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name },
          },
        });
        if (error) throw error;
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const title = isForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Create Account";

  return (
    <main className="pt-40 pb-24">
      <div className="max-w-md mx-auto px-6">
        <h1 className="text-lg tracking-[0.3em] font-extralight uppercase text-center mb-12">{title}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && !isForgotPassword && (
            <div>
              <label className="editorial-heading text-[9px] block mb-2">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-foreground bg-transparent py-2 text-[11px] tracking-widest outline-none placeholder:text-muted-foreground"
                placeholder="FULL NAME" required />
            </div>
          )}
          <div>
            <label className="editorial-heading text-[9px] block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-foreground bg-transparent py-2 text-[11px] tracking-widest outline-none placeholder:text-muted-foreground"
              placeholder="EMAIL ADDRESS" required />
          </div>
          {!isForgotPassword && (
            <div>
              <label className="editorial-heading text-[9px] block mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-foreground bg-transparent py-2 text-[11px] tracking-widest outline-none placeholder:text-muted-foreground"
                placeholder="PASSWORD" required minLength={6} />
            </div>
          )}

          {isLogin && !isForgotPassword && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 appearance-none border border-foreground checked:bg-foreground cursor-pointer" />
                <span className="text-[9px] tracking-widest uppercase text-muted-foreground">Remember me</span>
              </label>
              <button type="button" onClick={() => setIsForgotPassword(true)}
                className="text-[9px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 editorial-heading text-[11px] hover:opacity-80 transition-opacity min-h-[48px] disabled:opacity-50">
            {loading ? "..." : isForgotPassword ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-8 space-y-3">
          {isForgotPassword ? (
            <button onClick={() => setIsForgotPassword(false)}
              className="nav-link text-[9px] text-muted-foreground">
              ← Back to Sign In
            </button>
          ) : (
            <button onClick={() => setIsLogin(!isLogin)}
              className="nav-link text-[9px] text-muted-foreground">
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Auth;
