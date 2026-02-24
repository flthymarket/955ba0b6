import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  orderNumber: z.string().max(100).optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const tabs = [
  { id: "contact", label: "Contact" },
  { id: "shipping-policy", label: "Shipping" },
  { id: "refund-policy", label: "Refund" },
  { id: "privacy-policy", label: "Privacy" },
  { id: "terms-of-service", label: "Terms" },
];

const Help = () => {
  const location = useLocation();
  const hash = location.hash.replace("#", "");
  const [activeTab, setActiveTab] = useState(hash || "contact");
  const [policies, setPolicies] = useState<Record<string, { title: string; content: string }>>({});
  const [form, setForm] = useState({ name: "", email: "", orderNumber: "", message: "" });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (hash) setActiveTab(hash);
  }, [hash]);

  useEffect(() => {
    supabase.from("policies").select("*").then(({ data }) => {
      if (data) {
        const map: Record<string, { title: string; content: string }> = {};
        data.forEach((p) => (map[p.slug] = { title: p.title, content: p.content }));
        setPolicies(map);
      }
    });
  }, []);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      toast({ title: "Error", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSending(true);
    // For now just show success - can integrate email later
    toast({ title: "Message Sent", description: "We'll get back to you soon." });
    setForm({ name: "", email: "", orderNumber: "", message: "" });
    setSending(false);
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content.split("\n\n").map((block, i) => {
      if (block.startsWith("**") && block.endsWith("**")) {
        return <h3 key={i} className="text-[12px] tracking-[0.2em] uppercase font-medium mt-8 mb-3">{block.replace(/\*\*/g, "")}</h3>;
      }
      if (block.startsWith("- ")) {
        const items = block.split("\n").filter(l => l.startsWith("- "));
        return (
          <ul key={i} className="list-disc pl-6 space-y-1 mb-4">
            {items.map((item, j) => (
              <li key={j} className="text-[11px] font-light leading-relaxed text-muted-foreground">
                {item.replace(/^- /, "").replace(/\*\*/g, "")}
              </li>
            ))}
          </ul>
        );
      }
      return <p key={i} className="text-[11px] font-light leading-relaxed text-muted-foreground mb-4">{block.replace(/\*\*/g, "")}</p>;
    });
  };

  return (
    <main className="pt-36 pb-24">
      <div className="max-w-[900px] mx-auto px-6">
        <h1 className="text-lg tracking-[0.3em] font-extralight uppercase text-center mb-12">Help</h1>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 border-b border-border pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`editorial-heading text-[10px] pb-2 transition-opacity ${
                activeTab === tab.id ? "opacity-100 border-b border-foreground" : "opacity-40 hover:opacity-70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contact Form */}
        {activeTab === "contact" && (
          <div className="max-w-lg mx-auto">
            <h2 className="section-title">Contact Us</h2>
            <p className="text-[11px] text-muted-foreground text-center mb-8 font-light">
              Email us at flthymarket@gmail.com or use the form below.
            </p>
            <form onSubmit={handleContact} className="space-y-6">
              <div>
                <label className="editorial-heading text-[9px] block mb-2">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-b border-border bg-transparent py-2 text-[11px] tracking-widest outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  placeholder="YOUR NAME"
                  required
                />
              </div>
              <div>
                <label className="editorial-heading text-[9px] block mb-2">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-b border-border bg-transparent py-2 text-[11px] tracking-widest outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  placeholder="EMAIL ADDRESS"
                  required
                />
              </div>
              <div>
                <label className="editorial-heading text-[9px] block mb-2">Order Number (optional)</label>
                <input
                  type="text"
                  value={form.orderNumber}
                  onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                  className="w-full border-b border-border bg-transparent py-2 text-[11px] tracking-widest outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
                  placeholder="ORDER NUMBER"
                />
              </div>
              <div>
                <label className="editorial-heading text-[9px] block mb-2">Message *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border-b border-border bg-transparent py-2 text-[11px] tracking-widest outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground min-h-[120px] resize-none"
                  placeholder="YOUR MESSAGE"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-primary text-primary-foreground py-4 editorial-heading text-[11px] hover:opacity-80 transition-opacity min-h-[48px]"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        )}

        {/* Policy Pages */}
        {activeTab !== "contact" && policies[activeTab] && (
          <div>
            <h2 className="text-[14px] tracking-[0.3em] font-extralight uppercase text-center mb-8">
              {policies[activeTab].title}
            </h2>
            <div className="max-w-2xl mx-auto">
              {renderMarkdown(policies[activeTab].content)}
            </div>
          </div>
        )}

        {activeTab !== "contact" && !policies[activeTab] && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">Loading...</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Help;
