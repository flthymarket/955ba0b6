import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

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
          description: "Please check your email to verify your account before signing in.",
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const title = isForgotPassword ? "Reset Password" : isLogin ? "Sign In" : "Create Account";
  const inputCls = "w-full border-b border-foreground bg-transparent py-3 text-sm tracking-widest outline-none placeholder:text-muted-foreground focus:border-foreground/50 transition-colors min-h-[44px]";

  return (
    <main className="pt-32 sm:pt-36 md:pt-40 pb-24 animate-fade-in">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <h1 className="text-xl md:text-2xl tracking-[0.3em] font-extralight uppercase text-center mb-10 md:mb-12">{title}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && !isForgotPassword && (
            <div className="animate-fade-in">
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="FULL NAME" required />
            </div>
          )}
          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="EMAIL ADDRESS" required />
          </div>
          {!isForgotPassword && (
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="PASSWORD" required minLength={6} />
            </div>
          )}

          {isLogin && !isForgotPassword && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`w-5 h-5 border flex items-center justify-center transition-all duration-150 ${
                  rememberMe ? "bg-foreground border-foreground" : "border-foreground/60 group-hover:border-foreground"
                }`}>
                  {rememberMe && <Check className="w-3 h-3 text-background" />}
                </div>
                <span className="text-xs tracking-widest uppercase text-muted-foreground select-none">Remember me</span>
              </label>
              <button type="button" onClick={() => setIsForgotPassword(true)}
                className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-150">
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 text-sm tracking-[0.2em] uppercase font-light hover:opacity-80 transition-opacity duration-150 min-h-[52px] disabled:opacity-50">
            {loading ? "..." : isForgotPassword ? "Send Reset Link" : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-8 space-y-3">
          {isForgotPassword ? (
            <button onClick={() => setIsForgotPassword(false)}
              className="text-sm tracking-widest uppercase text-muted-foreground hover-gray px-3 py-2 transition-all">
              ← Back to Sign In
            </button>
          ) : (
            <button onClick={() => setIsLogin(!isLogin)}
              className="text-sm tracking-widest uppercase text-muted-foreground hover-gray px-3 py-2 transition-all">
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Auth;
