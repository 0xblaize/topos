"use client";

import { ChangeEvent, DragEvent, PointerEvent, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, Eraser, ImagePlus, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "motion/react";

const navy = "rgba(30,50,90,0.9)";

type CaptureViewProps = { username: string };
type Point = { x: number; y: number };
type Stroke = Point[];

export function CaptureView({ username }: CaptureViewProps) {
  const router = useRouterCompat();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [name, setName] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [draggingFile, setDraggingFile] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !image.naturalWidth) return;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    drawCanvas(canvas, image, [...strokes, ...(activeStroke ? [activeStroke] : [])]);
  }, [imageDataUrl, imageReady, strokes, activeStroke]);

  const loadFile = (file?: File) => {
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Choose a JPEG, PNG, or WebP room photo");
      return;
    }
    if (file.size > 9 * 1024 * 1024) {
      setMessage("Choose an image under 9 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(typeof reader.result === "string" ? reader.result : null);
      setImageReady(false);
      setStrokes([]);
      setActiveStroke(null);
      setRoomId(null);
      setMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => loadFile(event.target.files?.[0]);
  const onDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDraggingFile(true);
  };
  const onDragLeave = () => setDraggingFile(false);
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDraggingFile(false);
    loadFile(event.dataTransfer.files[0]);
  };
  const pointFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!imageDataUrl) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveStroke([pointFromEvent(event)]);
  };

  const moveStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!activeStroke) return;
    setActiveStroke([...activeStroke, pointFromEvent(event)]);
  };

  const finishStroke = () => {
    if (!activeStroke?.length) return;
    setStrokes([...strokes, activeStroke]);
    setActiveStroke(null);
  };

  const createRoom = async () => {
    if (!name.trim() || !imageDataUrl) {
      setMessage("Add a room name and photo first");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), sourceImageDataUrl: imageDataUrl }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not create room");
      setRoomId(body.room.id);
      setMessage("Capture saved. Paint over the clutter you want removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create room");
    } finally {
      setBusy(false);
    }
  };

  const saveMask = async () => {
    if (!roomId || !strokes.length || !canvasRef.current) {
      setMessage("Paint the clutter area before saving the mask");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = canvasRef.current.width;
      maskCanvas.height = canvasRef.current.height;
      const context = maskCanvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable");
      context.fillStyle = "#000";
      context.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      drawStrokes(context, strokes, "#fff");
      const response = await fetch(`/api/rooms/${roomId}/mask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maskDataUrl: maskCanvas.toDataURL("image/png") }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not save mask");

      const processResponse = await fetch(`/api/rooms/${roomId}/process`, { method: "POST" });
      const processBody = await processResponse.json();
      if (!processResponse.ok) throw new Error(processBody.error ?? "Could not start AI erase");
      setMessage(processBody.processing ? "AI erase started. Opening your room workspace…" : "AI erase complete. Opening your room workspace…");
      router.go(`/room/${roomId}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save mask");
    } finally {
      setBusy(false);
    }
  };

  const resetMask = () => {
    setStrokes([]);
    setActiveStroke(null);
    setMessage(null);
  };

  return (
    <main className="min-h-screen bg-[#f0f0f0] p-3 md:p-5">
      <section className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1536px] rounded-[1.5rem] md:rounded-[3rem] border border-white/50 bg-white/40 p-5 backdrop-blur-xl md:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <button onClick={() => router.go("/dashboard")} className="flex items-center gap-2 text-sm text-[rgba(30,50,90,0.7)] hover:text-[rgba(30,50,90,1)]">
            <ArrowLeft className="h-4 w-4" /> Back to workspace
          </button>
          <span className="flex items-center gap-2 text-xs text-[rgba(30,50,90,0.6)]"><Sparkles className="h-3.5 w-3.5" /> {username}</span>
        </header>

        <div className="mx-auto max-w-5xl">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[rgba(30,50,90,0.55)]">01 / Spatial capture</p>
            <h1 className="text-4xl font-normal tracking-tight text-[#5E6470] md:text-6xl">Clear the room first.</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#5E6470] opacity-75 md:text-base">Upload one wide photo. Then paint over the physical clutter you want Topos to erase.</p>
          </div>

          {!imageDataUrl ? (
            <label onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed p-8 text-center transition-colors ${draggingFile ? "border-[rgba(30,50,90,0.55)] bg-white/80" : "border-[rgba(30,50,90,0.22)] bg-white/50 hover:bg-white/70"}`}>
              <ImagePlus className="mb-4 h-10 w-10 text-[rgba(30,50,90,0.7)]" />
              <span className="text-lg text-[rgba(30,50,90,0.85)]">Drop a room photo here</span>
              <span className="mt-2 text-sm text-[rgba(30,50,90,0.55)]">or use your camera / file picker</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={onFileChange} className="sr-only" />
            </label>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-[rgba(30,50,90,0.08)] p-2">
                <img ref={imageRef} src={imageDataUrl} alt="Your captured room" className="pointer-events-none absolute h-0 w-0 opacity-0" onLoad={() => setImageReady(true)} />
                <canvas ref={canvasRef} className="block h-auto w-full cursor-crosshair rounded-[1.5rem] touch-none" onPointerDown={startStroke} onPointerMove={moveStroke} onPointerUp={finishStroke} onPointerCancel={finishStroke} />
                <div className="pointer-events-none absolute left-5 top-5 rounded-full bg-[rgba(180,68,58,0.85)] px-3 py-1.5 text-[11px] uppercase tracking-wider text-white">Paint clutter</div>
              </div>

              <aside className="rounded-[2rem] border border-white/50 bg-white/60 p-5 backdrop-blur-xl">
                <label className="text-[11px] uppercase tracking-wider text-[rgba(30,50,90,0.55)]">Room name</label>
                <input value={name} onChange={(event) => setName(event.target.value)} disabled={Boolean(roomId)} placeholder="Living room" className="mt-2 w-full rounded-full border border-[rgba(30,50,90,0.15)] bg-white/70 px-4 py-3 text-sm text-[rgba(30,50,90,0.9)] outline-none" />
                <p className="mt-5 text-xs leading-relaxed text-[rgba(30,50,90,0.6)]">The red overlay is your mask. It is sent to the erase pipeline as a real PNG mask.</p>
                <div className="mt-6 grid gap-2">
                  {!roomId && <ActionButton icon={<Check className="h-4 w-4" />} label="Save capture" busy={busy} onClick={createRoom} />}
                  {roomId && <ActionButton icon={<Eraser className="h-4 w-4" />} label="Erase painted area" busy={busy} onClick={saveMask} />}
                  <button onClick={resetMask} className="flex items-center justify-center gap-2 rounded-full border border-[rgba(30,50,90,0.14)] py-3 text-sm text-[rgba(30,50,90,0.7)] hover:bg-white/70"><RotateCcw className="h-4 w-4" /> Reset mask</button>
                  <label className="flex cursor-pointer items-center justify-center rounded-full border border-[rgba(30,50,90,0.14)] py-3 text-sm text-[rgba(30,50,90,0.7)] hover:bg-white/70">Replace photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="sr-only" /></label>
                </div>
                {roomId && <button onClick={() => router.go(`/room/${roomId}`)} className="mt-5 w-full text-xs text-[rgba(30,50,90,0.7)] underline underline-offset-4">Open room canvas</button>}
                {message && <p className="mt-4 text-xs leading-relaxed text-[rgba(30,50,90,0.7)]">{message}</p>}
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ActionButton({ icon, label, busy, onClick }: { icon: ReactNode; label: string; busy: boolean; onClick: () => void }) {
  return <motion.button whileHover={{ scale: busy ? 1 : 1.02 }} whileTap={{ scale: busy ? 1 : 0.98 }} disabled={busy} onClick={onClick} className="flex items-center justify-center gap-2 rounded-full bg-[rgba(30,50,90,0.9)] py-3 text-sm text-white disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}{busy ? "Saving…" : label}</motion.button>;
}

function drawCanvas(canvas: HTMLCanvasElement, image: HTMLImageElement, strokes: Stroke[]) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  drawStrokes(context, strokes, "rgba(180,68,58,0.72)");
}

function drawStrokes(context: CanvasRenderingContext2D, strokes: Stroke[], color: string) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = Math.max(24, context.canvas.width / 55);
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const stroke of strokes) {
    if (!stroke.length) continue;
    context.beginPath();
    context.moveTo(stroke[0].x, stroke[0].y);
    for (const point of stroke.slice(1)) context.lineTo(point.x, point.y);
    context.stroke();
  }
  context.restore();
}

function useRouterCompat() {
  return { go: (path: string) => { window.location.href = path; } };
}
