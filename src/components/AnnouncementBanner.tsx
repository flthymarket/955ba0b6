import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  banner_text: string;
  subtext: string | null;
  text_alignment: string | null;
  background_style: string | null;
  end_date: string | null;
  show_countdown: boolean | null;
  link_url: string | null;
}

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .eq("enabled", true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order("priority", { ascending: false })
        .limit(1)
        .single();
      if (data) setAnnouncement(data as Announcement);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!announcement?.show_countdown || !announcement.end_date) return;
    const interval = setInterval(() => {
      const diff = new Date(announcement.end_date!).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(""); clearInterval(interval); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [announcement]);

  if (!announcement || dismissed) return null;

  const bgStyles: Record<string, string> = {
    light: "bg-secondary text-foreground",
    dark: "bg-foreground text-background",
    accent: "bg-[hsl(352,82%,38%)] text-white",
  };

  const bg = bgStyles[announcement.background_style || "light"] || bgStyles.light;
  const align = announcement.text_alignment === "left" ? "text-left" : "text-center";

  const content = (
    <div className={`h-11 flex items-center justify-center px-6 ${bg} ${align} transition-opacity duration-150`}>
      <p className="text-[12px] tracking-[0.15em] uppercase font-light">
        {announcement.banner_text}
        {announcement.show_countdown && timeLeft && (
          <span className="ml-3">
            Ends in <span className="font-mono tabular-nums" style={{ color: announcement.background_style === "accent" ? "white" : "hsl(352, 82%, 38%)" }}>{timeLeft}</span>
          </span>
        )}
      </p>
    </div>
  );

  if (announcement.link_url) {
    return <a href={announcement.link_url} className="block hover:opacity-95 transition-opacity duration-150">{content}</a>;
  }

  return content;
};

export default AnnouncementBanner;
