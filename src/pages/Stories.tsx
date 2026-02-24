import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  publish_date: string | null;
}

const Stories = () => {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    supabase
      .from("stories")
      .select("*")
      .eq("published", true)
      .order("publish_date", { ascending: false })
      .then(({ data }) => {
        if (data) setStories(data);
      });
  }, []);

  if (stories.length === 0) {
    return (
      <main className="pt-36 pb-24">
        <div className="max-w-[1400px] mx-auto px-6 text-center py-20">
          <h1 className="text-lg tracking-[0.3em] font-extralight uppercase mb-4">Stories</h1>
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            Coming soon.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-36 pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <h1 className="text-lg tracking-[0.3em] font-extralight uppercase text-center mb-16">Stories</h1>
        <div className="space-y-24">
          {stories.map((story) => (
            <article key={story.id} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {story.image_url && (
                <div className="aspect-[3/4] overflow-hidden bg-secondary">
                  <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col justify-center">
                <h2 className="text-[14px] tracking-[0.3em] font-extralight uppercase mb-6">{story.title}</h2>
                {story.publish_date && (
                  <p className="text-[9px] text-muted-foreground tracking-widest mb-6">
                    {new Date(story.publish_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
                <div className="text-[11px] font-light leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {story.content}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Stories;
