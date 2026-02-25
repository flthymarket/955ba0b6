import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  bucket: string;
  onUpload: (url: string) => void;
  currentUrl?: string;
  className?: string;
}

const ImageUpload = ({ bucket, onUpload, currentUrl, className = "" }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      console.error("Upload error:", error);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setPreview(data.publicUrl);
    onUpload(data.publicUrl);
    setUploading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {preview ? (
        <div className="relative group">
          <img src={preview} alt="" className="w-full aspect-square object-cover border border-border" />
          <button type="button" onClick={() => { setPreview(""); onUpload(""); }}
            className="absolute top-1 right-1 w-6 h-6 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()}
          className="w-full aspect-square border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-foreground transition-colors cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
          <span className="text-[9px] tracking-widest uppercase text-muted-foreground">
            {uploading ? "Uploading..." : "Upload"}
          </span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
};

export default ImageUpload;
