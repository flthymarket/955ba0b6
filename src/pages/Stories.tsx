import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [searchParams] = useSearchParams();
  const storyId = searchParams.get("story");

  useEffect(() => {
    supabase
      .from("stories")
      .select("*")
      .eq("published", true)
      .order("publish_date", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setStories(data);
          if (storyId) {
            const found = data.find((s) => s.id === storyId);
            if (found) setSelectedStory(found);
          }
        }
      });
  }, [storyId]);

  if (selectedStory) {
    return (
      <main className="pt-32 pb-24 animate-fade-in">
        <div className="max-w-[900px] mx-auto px-6">
          <button
            onClick={() => setSelectedStory(null)}
            className="nav-link text-[9px] text-muted-foreground mb-8 block"
          >
            ← Back to Stories
          </button>
          {selectedStory.image_url && (
            <div className="aspect-[16/9] overflow-hidden bg-secondary mb-8">
              <img src={selectedStory.image_url} alt={selectedStory.title} className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-[16px] md:text-[20px] tracking-[0.3em] font-extralight uppercase mb-4">
            {selectedStory.title}
          </h1>
          {selectedStory.publish_date && (
            <p className="text-[9px] text-muted-foreground tracking-widest mb-8">
              {new Date(selectedStory.publish_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
          <div className="text-[12px] font-light leading-[1.8] text-muted-foreground whitespace-pre-wrap">
            {selectedStory.content}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-6">
        <h1 className="text-[16px] md:text-lg tracking-[0.3em] font-extralight uppercase text-center mb-2">
          FlthyMrkt Presents
        </h1>
        <p className="text-center text-[10px] text-muted-foreground tracking-[0.2em] font-light mb-16">
          FASHION HISTORY · NEW STORIES EVERY WEEK
        </p>

        {stories.length === 0 ? (
          <p className="text-center text-muted-foreground text-xs tracking-widest uppercase py-20">
            Coming soon.
          </p>
        ) : (
          <div className="space-y-16">
            {stories.map((story) => (
              <article
                key={story.id}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 cursor-pointer group"
                onClick={() => setSelectedStory(story)}
              >
                {story.image_url && (
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <h2 className="text-[13px] tracking-[0.3em] font-extralight uppercase mb-4 group-hover:opacity-60 transition-opacity duration-300">
                    {story.title}
                  </h2>
                  {story.publish_date && (
                    <p className="text-[9px] text-muted-foreground tracking-widest mb-4">
                      {new Date(story.publish_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                  <p className="text-[11px] font-light leading-relaxed text-muted-foreground line-clamp-4">
                    {story.content}
                  </p>
                  <span className="mt-4 text-[9px] tracking-[0.2em] uppercase font-light text-foreground">
                    Read More →
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Stories;
