"use client";

import { Component, type ReactNode, Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Clone, Html, useGLTF } from "@react-three/drei";
import { ArrowLeft, Armchair, LampCeiling, Loader2, Minus, Plus, Redo2, RotateCcw, Save, Sparkles, Trash2, TreePine, Undo2 } from "lucide-react";
import { motion } from "motion/react";
import type { FurniturePlacement, Room } from "@/lib/rooms";
import { furnitureCatalog, isFurnitureModelId, type FurnitureModelId } from "@/lib/furniture";

const WORLD_WIDTH = 10;
const WORLD_HEIGHT = 6;

const catalog = furnitureCatalog.map((item) => ({
  ...item,
  icon: item.id === "sofa" ? Armchair : item.id === "lamp" ? LampCeiling : TreePine,
}));

const modelPaths: Record<FurnitureModelId, string> = Object.fromEntries(
  furnitureCatalog.map((item) => [item.id, item.path]),
) as Record<FurnitureModelId, string>;

export function RoomWorkspace({ initialRoom }: { initialRoom: Room }) {
  const [room, setRoom] = useState(initialRoom);
  const [placements, setPlacements] = useState(initialRoom.furniture);
  const [savedPlacements, setSavedPlacements] = useState(initialRoom.furniture);
  const [history, setHistory] = useState<typeof initialRoom.furniture[]>([]);
  const [future, setFuture] = useState<typeof initialRoom.furniture[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("sofa");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (room.status !== "processing") return;
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/rooms/${room.id}`, { cache: "no-store" });
        if (!response.ok || cancelled) return;
        const body = await response.json() as { room?: Room };
        if (body.room && !cancelled) {
          setRoom(body.room);
          if (body.room.status === "cleared") setMessage("The room is cleared. Build on the empty canvas.");
          if (body.room.status !== "processing" && body.room.processingErrorMessage) setMessage(body.room.processingErrorMessage);
        }
      } catch {
        if (!cancelled) setMessage("Could not refresh processing status.");
      }
    };
    const timer = window.setInterval(poll, 3000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [room.id, room.status]);

  const addFurniture = () => {
    const placement: FurniturePlacement = {
      id: crypto.randomUUID(),
      modelId: selectedModel,
      x: 0.5,
      y: 0.62,
      scale: selectedModel === "lamp" ? 0.8 : 1,
      rotation: 0,
    };
    updatePlacements([...placements, placement]);
    setActiveId(placement.id);
  };

  const updatePlacements = (next: typeof placements) => {
    setHistory((current) => [...current.slice(-19), placements]);
    setFuture([]);
    setPlacements(next);
  };

  const moveFurniture = (id: string, x: number, y: number) => {
    updatePlacements(placements.map((placement) => placement.id === id ? { ...placement, x, y } : placement));
  };

  const selectedPlacement = placements.find((placement) => placement.id === activeId);
  const adjustSelected = (changes: Partial<FurniturePlacement>) => {
    if (!selectedPlacement) return;
    updatePlacements(placements.map((placement) => placement.id === activeId ? { ...placement, ...changes } : placement));
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((current) => [...current, placements]);
    setHistory((current) => current.slice(0, -1));
    setPlacements(previous);
  };

  const redo = () => {
    const next = future.at(-1);
    if (!next) return;
    setHistory((current) => [...current, placements]);
    setFuture((current) => current.slice(0, -1));
    setPlacements(next);
  };

  const resetPlacements = () => {
    setHistory((current) => [...current.slice(-19), placements]);
    setFuture([]);
    setPlacements(savedPlacements);
  };

  const removeSelected = () => {
    if (!activeId) return;
    updatePlacements(placements.filter((placement) => placement.id !== activeId));
    setActiveId(null);
  };

  const savePlacements = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ furniture: placements }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not save furniture");
      setRoom(body.room);
      setPlacements(body.room.furniture);
      setSavedPlacements(body.room.furniture);
      setHistory([]);
      setFuture([]);
      setMessage("Furniture placement saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save furniture");
    } finally {
      setBusy(false);
    }
  };

  const processRoom = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/rooms/${room.id}/process`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "AI processing unavailable");
      if (body.room) setRoom(body.room);
      setMessage(body.processing ? "AI erase started. This workspace will update automatically." : "The room is cleared. Build on the empty canvas.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI processing unavailable");
    } finally {
      setBusy(false);
    }
  };

  const background = room.cleanedImageDataUrl ?? room.sourceImageDataUrl;

  return (
    <main className="min-h-screen bg-[#f0f0f0] p-3 md:p-5">
      <section className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-[1536px] rounded-[1.5rem] md:rounded-[3rem] border border-white/50 bg-white/40 p-5 backdrop-blur-xl md:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <button onClick={() => { window.location.href = "/dashboard"; }} className="flex items-center gap-2 text-sm text-[rgba(30,50,90,0.7)] hover:text-[rgba(30,50,90,1)]"><ArrowLeft className="h-4 w-4" /> Workspace</button>
          <div className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-[rgba(30,50,90,0.8)]" /><span className="text-sm text-[rgba(30,50,90,0.8)]">{room.name}</span></div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(30,50,90,0.55)]">03 / Static AR canvas</p>
                <h1 className="mt-2 text-3xl font-normal tracking-tight text-[#5E6470] md:text-5xl">Build on empty space.</h1>
              </div>
              <span className="rounded-full bg-white/60 px-3 py-1.5 text-[11px] uppercase tracking-wider text-[rgba(30,50,90,0.65)]">{room.status.replace("_", " ")}</span>
            </div>

            <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/60 bg-[rgba(30,50,90,0.1)] shadow-sm" style={{ backgroundImage: `url(${background})`, backgroundSize: "cover", backgroundPosition: "center" }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(30,50,90,0.22)] to-transparent" />
              <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 85 }} onPointerMissed={() => setActiveId(null)}>
                <ambientLight intensity={2} />
                <directionalLight position={[2, 4, 6]} intensity={2} />
                <Suspense fallback={<Html center className="rounded-full bg-white/85 px-3 py-1.5 text-xs text-[rgba(30,50,90,0.7)]">Loading furniture…</Html>}>
                  {placements.map((placement) => (
                    <FurnitureObject
                      key={placement.id}
                      placement={placement}
                      active={placement.id === activeId}
                      onSelect={() => setActiveId(placement.id)}
                      onMove={(x, y) => moveFurniture(placement.id, x, y)}
                    />
                  ))}
                </Suspense>
              </Canvas>
              <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/70 px-3 py-1.5 text-[11px] uppercase tracking-wider text-[rgba(30,50,90,0.7)]">Static depth plane</div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/50 bg-white/60 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[rgba(30,50,90,0.55)]">Furniture catalog</p>
            <div className="mt-4 grid gap-2">
              {catalog.map((item) => {
                const Icon = item.icon;
                return <button key={item.id} onClick={() => setSelectedModel(item.id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${selectedModel === item.id ? "border-[rgba(30,50,90,0.35)] bg-white/80" : "border-white/40 bg-white/40 hover:bg-white/70"}`}><Icon className="h-5 w-5 text-[rgba(30,50,90,0.8)]" /><span className="text-sm text-[rgba(30,50,90,0.85)]">{item.label}</span></button>;
              })}
            </div>
            <button onClick={addFurniture} disabled={busy} className="mt-4 w-full rounded-full bg-[rgba(30,50,90,0.9)] py-3 text-sm text-white hover:bg-[rgba(30,50,90,1)] disabled:opacity-50">Add to canvas</button>
            <div className="mt-2 grid grid-cols-4 gap-2">
              <button onClick={undo} disabled={!history.length || busy} aria-label="Undo" className="flex items-center justify-center rounded-full border border-[rgba(30,50,90,0.14)] py-2 text-[rgba(30,50,90,0.7)] disabled:opacity-40"><Undo2 className="h-4 w-4" /></button>
              <button onClick={redo} disabled={!future.length || busy} aria-label="Redo" className="flex items-center justify-center rounded-full border border-[rgba(30,50,90,0.14)] py-2 text-[rgba(30,50,90,0.7)] disabled:opacity-40"><Redo2 className="h-4 w-4" /></button>
              <button onClick={resetPlacements} disabled={busy} aria-label="Reset changes" className="flex items-center justify-center rounded-full border border-[rgba(30,50,90,0.14)] py-2 text-[rgba(30,50,90,0.7)] disabled:opacity-40"><RotateCcw className="h-4 w-4" /></button>
              <button onClick={removeSelected} disabled={!selectedPlacement || busy} aria-label="Remove selected" className="flex items-center justify-center rounded-full border border-[rgba(180,68,58,0.2)] py-2 text-[#9e4037] disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
            </div>
            {selectedPlacement && <div className="mt-3 grid grid-cols-3 gap-2">
              <button onClick={() => adjustSelected({ rotation: selectedPlacement.rotation - 0.15 })} disabled={busy} className="rounded-full border border-[rgba(30,50,90,0.14)] py-2 text-xs text-[rgba(30,50,90,0.7)]">Rotate −</button>
              <button onClick={() => adjustSelected({ scale: Math.max(0.45, selectedPlacement.scale - 0.1) })} disabled={busy} className="flex items-center justify-center rounded-full border border-[rgba(30,50,90,0.14)] py-2 text-[rgba(30,50,90,0.7)]"><Minus className="h-3 w-3" /></button>
              <button onClick={() => adjustSelected({ scale: Math.min(1.6, selectedPlacement.scale + 0.1) })} disabled={busy} className="flex items-center justify-center rounded-full border border-[rgba(30,50,90,0.14)] py-2 text-[rgba(30,50,90,0.7)]"><Plus className="h-3 w-3" /></button>
            </div>}
            <button onClick={savePlacements} disabled={busy || placements.length === 0} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(30,50,90,0.16)] py-3 text-sm text-[rgba(30,50,90,0.75)] disabled:opacity-50"><Save className="h-4 w-4" /> {busy ? "Saving…" : "Save placement"}</button>
            {room.maskDataUrl && !room.cleanedImageDataUrl && room.status !== "processing" && <button onClick={processRoom} disabled={busy} className="mt-5 w-full rounded-full border border-[rgba(180,68,58,0.2)] bg-[rgba(180,68,58,0.07)] py-3 text-sm text-[#9e4037] disabled:opacity-50">Run AI erase</button>}
            {room.status === "processing" && <p className="mt-5 text-sm text-[rgba(30,50,90,0.72)]">AI erase is processing. This workspace will update automatically.</p>}
            <p className="mt-5 text-xs leading-relaxed text-[rgba(30,50,90,0.58)]">Furniture is placed on a fixed-angle floor plane. This is static AR, not live camera tracking.</p>
            {message && <p className="mt-4 text-xs leading-relaxed text-[rgba(30,50,90,0.75)]">{message}</p>}
          </aside>
        </div>
      </section>
    </main>
  );
}

function FurnitureObject({ placement, active, onSelect, onMove }: { placement: FurniturePlacement; active: boolean; onSelect: () => void; onMove: (x: number, y: number) => void }) {
  const modelId = isFurnitureModelId(placement.modelId) ? placement.modelId : null;

  return <group position={[((placement.x - 0.5) * WORLD_WIDTH), ((0.5 - placement.y) * WORLD_HEIGHT), 0]} scale={placement.scale} rotation={[0, 0, placement.rotation]} onPointerDown={(event) => { event.stopPropagation(); onSelect(); }} onPointerMove={(event) => { if (!active || event.buttons === 0) return; event.stopPropagation(); onMove(clamp(event.point.x / WORLD_WIDTH + 0.5, 0.08, 0.92), clamp(0.5 - event.point.y / WORLD_HEIGHT, 0.08, 0.92)); }}>
    {modelId ? <FurnitureAssetBoundary fallback={<FurnitureUnavailable label={`${placement.modelId} unavailable`} />}><FurnitureAsset modelId={modelId} /></FurnitureAssetBoundary> : <FurnitureUnavailable label="Unknown furniture" />}
    {active && <mesh position={[0, 0, -0.45]}><ringGeometry args={[1.2, 1.28, 32]} /><meshBasicMaterial color="#aebbd0" transparent opacity={0.8} /></mesh>}
  </group>;
}

function FurnitureAsset({ modelId }: { modelId: FurnitureModelId }) {
  const { scene } = useGLTF(modelPaths[modelId]);
  return <Clone object={scene} castShadow receiveShadow />;
}

function FurnitureUnavailable({ label }: { label: string }) {
  return <Html center className="pointer-events-none whitespace-nowrap rounded-full bg-[rgba(180,68,58,0.92)] px-2 py-1 text-[10px] text-white shadow-sm">{label}</Html>;
}

class FurnitureAssetBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
