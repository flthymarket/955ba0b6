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

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase.
      from("announcements").
      select("*").
      eq("enabled", true).
      or(`start_date.is.null,start_date.lte.${now}`).
      or(`end_date.is.null,end_date.gte.${now}`).
      order("priority", { ascending: false }).
      limit(1).
      single();
      if (data) setAnnouncement(data as Announcement);
    };
    fetchAnnouncement();
  }, []);

  useEffect(() => {
    if (!announcement?.show_countdown || !announcement.end_date) return;
    const interval = setInterval(() => {
      const diff = new Date(announcement.end_date!).getTime() - Date.now();
      if (diff <= 0) {setTimeLeft("");clearInterval(interval);return;}
      const h = Math.floor(diff / 3600000);
      const m = Math.floor(diff % 3600000 / 60000);
      const s = Math.floor(diff % 60000 / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [announcement]);

  if (!announcement) return null;

  const bgStyles: Record<string, string> = {
    light: "bg-secondary text-foreground",
    dark: "bg-foreground text-background",
    accent: "bg-[hsl(352,82%,38%)] text-white"
  };

  const bg = bgStyles[announcement.background_style || "dark"] || bgStyles.dark;

  const marqueeText =
  <span className="inline-flex items-center gap-8 text-[11px] sm:text-[12px] tracking-[0.2em] uppercase font-light whitespace-nowrap">
      <span>{announcement.banner_text}</span>
      {announcement.show_countdown && timeLeft &&
    <span>
          Ends in <span className="font-mono tabular-nums">{timeLeft}</span>
        </span>
    }
      
      <span>{announcement.banner_text}</span>
      {announcement.subtext && <span>{announcement.subtext}</span>}
      <span>★</span>
      <span>{announcement.banner_text}</span>
      <span>★</span>
      <span>{announcement.banner_text}</span>
      {announcement.subtext && <span>{announcement.subtext}</span>}
      
    </span>;


  const content =
  <div className={`h-10 flex items-center overflow-hidden ${bg}`}>
      


    
    </div>;


  if (announcement.link_url) {
    return <a href={announcement.link_url} className="block">{content}</a>;
  }

  return content;
};

export default AnnouncementBanner;