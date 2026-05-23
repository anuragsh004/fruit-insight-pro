import { useCallback, useRef, useState } from "react";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onFile: (file: File) => void;
  busy?: boolean;
}

export function UploadZone({ onFile, busy }: Props) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const handle = useCallback((file: File | undefined | null) => {
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert("Image must be 25MB or less.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    onFile(file);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files?.[0]); }}
      className={cn(
        "glass-card relative flex min-h-[360px] flex-col items-center justify-center rounded-3xl p-8 text-center transition",
        dragging && "ring-2 ring-accent",
      )}
    >
      {preview ? (
        <div className="relative w-full max-w-md">
          <img src={preview} alt="Preview" className="w-full rounded-2xl shadow-lg" />
          {!busy && (
            <button onClick={() => setPreview(null)} className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur">
              <X className="h-4 w-4" />
            </button>
          )}
          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/60 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="font-medium">AI analyzing your fruit…</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Upload className="h-7 w-7" />
          </div>
          <h3 className="font-display text-xl">Drop your fruit photo here</h3>
          <p className="mt-1 text-sm text-muted-foreground">JPG or PNG, up to 10MB</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => inputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload image
            </Button>
            <Button variant="outline" onClick={() => camRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" /> Use camera
            </Button>
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden"
            onChange={(e) => handle(e.target.files?.[0])} />
          <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => handle(e.target.files?.[0])} />
        </>
      )}
    </div>
  );
}
