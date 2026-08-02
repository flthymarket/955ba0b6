import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user && isAdmin) navigate("/admin");
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    }
  };

  const inputCls =
    "w-full border-b border-foreground bg-transparent py-3 text-[14px] outline-none placeholder:text-muted-foreground min-h-[48px]";

  return (
    <main className="pt-20 pb-24 animate-fade-in">
      <div className="max-w-md mx-auto px-5">
        <h1 className="section-title mb-3">Staff Login</h1>
        <p className="text-[13px] text-muted-foreground text-center mb-10">
          Authorized staff accounts only.
        </p>

        {user && !isAdmin && (
          <p className="text-[13px] text-center mb-8" style={{ color: "hsl(var(--sale))" }}>
            This account doesn't have staff access.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Staff email"
            className={inputCls}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputCls}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 nav-link min-h-[52px] disabled:opacity-50"
          >
            {loading ? "..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default StaffLogin;
