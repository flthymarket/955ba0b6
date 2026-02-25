import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also check hash
    if (window.location.hash.includes("type=recovery")) setReady(true);
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/auth");
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <main className="pt-40 pb-24 text-center">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">Verifying reset link...</p>
      </main>
    );
  }

  return (
    <main className="pt-40 pb-24">
      <div className="max-w-md mx-auto px-6">
        <h1 className="text-lg tracking-[0.3em] font-extralight uppercase text-center mb-12">New Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="editorial-heading text-[9px] block mb-2">New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-foreground bg-transparent py-2 text-[11px] tracking-widest outline-none placeholder:text-muted-foreground"
              placeholder="NEW PASSWORD" required minLength={6} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 editorial-heading text-[11px] hover:opacity-80 transition-opacity min-h-[48px] disabled:opacity-50">
            {loading ? "..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
