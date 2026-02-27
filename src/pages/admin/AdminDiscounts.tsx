import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { useToast } from "@/hooks/use-toast";

const AdminDiscounts = () => {
  const { toast } = useToast();

  // Flash Sale state
  const [flashSale, setFlashSale] = useState({
    id: "",
    enabled: false,
    scope: "store",
    category: "",
    discount_percentage: "0",
    start_date: "",
    end_date: "",
    stacking_enabled: false,
  });

  // Announcement state
  const [announcement, setAnnouncement] = useState({
    id: "",
    enabled: false,
    banner_type: "informational",
    banner_text: "",
    subtext: "",
    text_alignment: "center",
    background_style: "light",
    start_date: "",
    end_date: "",
    show_countdown: false,
    link_url: "",
  });

  useEffect(() => {
    // Fetch flash sale
    supabase.from("flash_sales").select("*").limit(1).single().then(({ data }) => {
      if (data) setFlashSale({
        id: data.id, enabled: data.enabled || false, scope: data.scope || "store",
        category: data.category || "", discount_percentage: String(data.discount_percentage || 0),
        start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : "",
        end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : "",
        stacking_enabled: data.stacking_enabled || false,
      });
    });

    // Fetch announcement
    supabase.from("announcements").select("*").order("priority", { ascending: false }).limit(1).single().then(({ data }) => {
      if (data) setAnnouncement({
        id: data.id, enabled: data.enabled || false, banner_type: data.banner_type || "informational",
        banner_text: data.banner_text || "", subtext: data.subtext || "",
        text_alignment: data.text_alignment || "center", background_style: data.background_style || "light",
        start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : "",
        end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : "",
        show_countdown: data.show_countdown || false, link_url: data.link_url || "",
      });
    });
  }, []);

  const saveFlashSale = async () => {
    const payload = {
      enabled: flashSale.enabled, scope: flashSale.scope, category: flashSale.category || null,
      discount_percentage: parseFloat(flashSale.discount_percentage) || 0,
      start_date: flashSale.start_date ? new Date(flashSale.start_date).toISOString() : null,
      end_date: flashSale.end_date ? new Date(flashSale.end_date).toISOString() : null,
      stacking_enabled: flashSale.stacking_enabled,
    };
    if (flashSale.id) {
      await supabase.from("flash_sales").update(payload).eq("id", flashSale.id);
    } else {
      const { data } = await supabase.from("flash_sales").insert(payload).select("id").single();
      if (data) setFlashSale((p) => ({ ...p, id: data.id }));
    }
    toast({ title: "Flash sale saved" });
  };

  const saveAnnouncement = async () => {
    const payload = {
      enabled: announcement.enabled, banner_type: announcement.banner_type,
      banner_text: announcement.banner_text, subtext: announcement.subtext || null,
      text_alignment: announcement.text_alignment, background_style: announcement.background_style,
      start_date: announcement.start_date ? new Date(announcement.start_date).toISOString() : null,
      end_date: announcement.end_date ? new Date(announcement.end_date).toISOString() : null,
      show_countdown: announcement.show_countdown, link_url: announcement.link_url || null,
    };
    if (announcement.id) {
      await supabase.from("announcements").update(payload).eq("id", announcement.id);
    } else {
      const { data } = await supabase.from("announcements").insert(payload).select("id").single();
      if (data) setAnnouncement((p) => ({ ...p, id: data.id }));
    }
    toast({ title: "Announcement saved" });
  };

  const inputCls = "w-full border border-border bg-transparent px-3 py-2.5 text-[11px] outline-none focus:border-foreground transition-colors duration-150";
  const labelCls = "text-[9px] tracking-widest uppercase text-muted-foreground block mb-1.5";
  const toggleCls = (on: boolean) => `relative w-10 h-5 rounded-full transition-colors duration-150 cursor-pointer ${on ? "bg-[hsl(352,82%,38%)]" : "bg-border"}`;
  const knobCls = (on: boolean) => `absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform duration-150 ${on ? "translate-x-5" : "translate-x-0.5"}`;

  return (
    <AdminLayout>
      <h1 className="text-[14px] tracking-[0.3em] uppercase font-extralight mb-8">Discounts & Promotions</h1>

      <div className="max-w-2xl space-y-8">
        {/* Flash Sale Manager */}
        <div className={`border p-6 space-y-5 transition-all duration-150 ${flashSale.enabled ? "border-l-2 border-l-[hsl(352,82%,38%)] border-border" : "border-border"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="editorial-heading text-[10px]">Flash Sale Manager</h3>
              {flashSale.enabled && (
                <span className="text-[10px] tracking-[0.1em] uppercase font-light px-2 py-0.5 border border-[hsl(352,82%,38%)] text-[hsl(352,82%,38%)] rounded-full">Active</span>
              )}
            </div>
            <button onClick={() => setFlashSale((p) => ({ ...p, enabled: !p.enabled }))} className={toggleCls(flashSale.enabled)}>
              <div className={knobCls(flashSale.enabled)} />
            </button>
          </div>

          {flashSale.enabled && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className={labelCls}>Scope</label>
                <div className="flex flex-col gap-2">
                  {["store", "category"].map((s) => (
                    <label key={s} className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${flashSale.scope === s ? "border-[hsl(352,82%,38%)]" : "border-border"}`}>
                        {flashSale.scope === s && <div className="w-2 h-2 rounded-full bg-[hsl(352,82%,38%)]" />}
                      </div>
                      <span className="text-[10px] tracking-wide font-light capitalize">{s === "store" ? "Entire Store" : "Category"}</span>
                    </label>
                  ))}
                </div>
              </div>

              {flashSale.scope === "category" && (
                <div>
                  <label className={labelCls}>Category</label>
                  <select value={flashSale.category} onChange={(e) => setFlashSale((p) => ({ ...p, category: e.target.value }))} className={inputCls}>
                    <option value="">Select</option>
                    <option value="All">All</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Discount %</label>
                  <input type="number" min="1" max="90" value={flashSale.discount_percentage}
                    onChange={(e) => setFlashSale((p) => ({ ...p, discount_percentage: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer mt-6">
                    <button onClick={() => setFlashSale((p) => ({ ...p, stacking_enabled: !p.stacking_enabled }))} className={toggleCls(flashSale.stacking_enabled)}>
                      <div className={knobCls(flashSale.stacking_enabled)} />
                    </button>
                    <span className="text-[10px] tracking-wide font-light">Stack with product discounts</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input type="datetime-local" value={flashSale.start_date}
                    onChange={(e) => setFlashSale((p) => ({ ...p, start_date: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input type="datetime-local" value={flashSale.end_date}
                    onChange={(e) => setFlashSale((p) => ({ ...p, end_date: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <button onClick={saveFlashSale}
                className="bg-primary text-primary-foreground px-8 py-3 editorial-heading text-[11px] hover:opacity-80 transition-opacity duration-150 min-h-[44px]">
                Save Flash Sale
              </button>
            </div>
          )}
        </div>

        {/* Announcement Banner */}
        <div className="border border-border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="editorial-heading text-[10px]">Announcement Banner</h3>
            <button onClick={() => setAnnouncement((p) => ({ ...p, enabled: !p.enabled }))} className={toggleCls(announcement.enabled)}>
              <div className={knobCls(announcement.enabled)} />
            </button>
          </div>

          {announcement.enabled && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Banner Type</label>
                  <select value={announcement.banner_type}
                    onChange={(e) => setAnnouncement((p) => ({ ...p, banner_type: e.target.value }))} className={inputCls}>
                    <option value="informational">Informational</option>
                    <option value="flash_sale">Flash Sale</option>
                    <option value="limited_drop">Limited Drop</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Background</label>
                  <select value={announcement.background_style}
                    onChange={(e) => setAnnouncement((p) => ({ ...p, background_style: e.target.value }))} className={inputCls}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="accent">Accent (Red)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Banner Text</label>
                <input value={announcement.banner_text} maxLength={120}
                  onChange={(e) => setAnnouncement((p) => ({ ...p, banner_text: e.target.value }))} className={inputCls} placeholder="FLASH SALE — 25% OFF SITEWIDE" />
              </div>
              <div>
                <label className={labelCls}>Subtext (Optional)</label>
                <input value={announcement.subtext}
                  onChange={(e) => setAnnouncement((p) => ({ ...p, subtext: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Link URL (Optional)</label>
                <input value={announcement.link_url}
                  onChange={(e) => setAnnouncement((p) => ({ ...p, link_url: e.target.value }))} className={inputCls} placeholder="/collection" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input type="datetime-local" value={announcement.start_date}
                    onChange={(e) => setAnnouncement((p) => ({ ...p, start_date: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input type="datetime-local" value={announcement.end_date}
                    onChange={(e) => setAnnouncement((p) => ({ ...p, end_date: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button onClick={() => setAnnouncement((p) => ({ ...p, show_countdown: !p.show_countdown }))} className={toggleCls(announcement.show_countdown)}>
                    <div className={knobCls(announcement.show_countdown)} />
                  </button>
                  <span className="text-[10px] tracking-wide font-light">Show Countdown</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <select value={announcement.text_alignment}
                    onChange={(e) => setAnnouncement((p) => ({ ...p, text_alignment: e.target.value }))} className="border border-border bg-transparent px-2 py-1 text-[10px] outline-none">
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                  </select>
                </label>
              </div>

              {/* Preview */}
              {announcement.banner_text && (
                <div>
                  <label className={labelCls}>Preview</label>
                  <div className={`h-11 flex items-center justify-center px-4 text-[12px] tracking-[0.15em] uppercase font-light ${
                    announcement.background_style === "dark" ? "bg-foreground text-background" :
                    announcement.background_style === "accent" ? "bg-[hsl(352,82%,38%)] text-white" :
                    "bg-secondary text-foreground"
                  }`}>
                    {announcement.banner_text}
                  </div>
                </div>
              )}

              <button onClick={saveAnnouncement}
                className="bg-primary text-primary-foreground px-8 py-3 editorial-heading text-[11px] hover:opacity-80 transition-opacity duration-150 min-h-[44px]">
                Save Announcement
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDiscounts;
