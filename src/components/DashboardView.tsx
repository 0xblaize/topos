"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Boxes, Eraser, LogOut, Plus, ScanLine, Sparkles } from "lucide-react";
import { statusLabel, type Room, type RoomStatus } from "@/lib/rooms";

const statusStyles: Record<RoomStatus, string> = {
  captured: "bg-[rgba(30,50,90,0.08)] text-[rgba(30,50,90,0.7)]",
  mask_ready: "bg-[rgba(30,50,90,0.12)] text-[rgba(30,50,90,0.8)]",
  processing: "bg-[rgba(30,50,90,0.16)] text-[rgba(30,50,90,0.9)]",
  ai_unavailable: "bg-[rgba(180,68,58,0.12)] text-[#9e4037]",
  cleared: "bg-[rgba(30,50,90,0.14)] text-[rgba(30,50,90,0.9)]",
  furnished: "bg-[rgba(30,50,90,0.9)] text-white",
};

const formatCapturedAt = (value: string) => new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

export function DashboardView({ username, rooms }: { username: string; rooms: Room[] }) {
  const stats = [
    { label: "Rooms Captured", value: String(rooms.length), icon: ScanLine },
    { label: "Objects Erased", value: String(rooms.reduce((total, room) => total + room.objectsRemoved, 0)), icon: Eraser },
    { label: "Models Placed", value: String(rooms.reduce((total, room) => total + room.itemsPlaced, 0)), icon: Boxes },
  ];

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="w-full min-h-screen flex items-start justify-center p-3 md:p-5 bg-[#f0f0f0]">
      <section className="relative w-full max-w-[1536px] min-h-[calc(100vh-1.5rem)] md:min-h-[calc(100vh-2.5rem)] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden bg-white/40 backdrop-blur-xl border border-white/50">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-[rgba(30,50,90,0.06)] pointer-events-none" />

        <div className="relative z-10 p-6 md:p-10">
          <header className="flex items-center justify-between mb-10 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="font-regular tracking-tighter text-xl text-[rgba(30,50,90,0.9)]">TOPOS</span>
              <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/30">
                <Sparkles className="w-3.5 h-3.5 text-[rgba(30,50,90,0.8)]" />
                <span className="text-[12px] text-[rgba(30,50,90,0.9)]">{username}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { window.location.href = "/capture"; }}
                className="flex items-center bg-[rgba(30,50,90,0.8)] text-white rounded-full pl-2 pr-5 py-2 gap-2.5 hover:bg-[rgba(30,50,90,1)] transition-colors"
              >
                <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-normal">New capture</span>
              </motion.button>

              <button
                onClick={signOut}
                aria-label="Sign out"
                className="w-10 h-10 rounded-full bg-white/60 border border-white/40 flex items-center justify-center text-[rgba(30,50,90,0.7)] hover:text-[rgba(30,50,90,1)] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          <motion.h1
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#5E6470] tracking-tight leading-[1.05] mb-2"
          >
            Your cleared rooms
          </motion.h1>
          <p className="text-sm md:text-base text-[#5E6470] opacity-70 mb-8 max-w-xl">
            Every capture, the clutter removed from it, and what you have placed on the empty canvas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                className="p-5 rounded-[1.5rem] bg-white/50 backdrop-blur-xl border border-white/40 flex items-center gap-4"
              >
                <div className="bg-[rgba(30,50,90,0.06)] w-12 h-12 rounded-full flex items-center justify-center border border-[rgba(30,50,90,0.1)] shrink-0">
                  <stat.icon className="w-5 h-5 text-[rgba(30,50,90,0.8)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-normal text-[rgba(30,50,90,0.9)] tracking-tight">{stat.value}</span>
                  <span className="text-[11px] font-normal text-[rgba(30,50,90,0.6)] uppercase tracking-wider">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-[1.5rem] md:rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white/40 overflow-hidden">
            <div className="px-5 md:px-7 py-4 border-b border-[rgba(30,50,90,0.08)] flex items-center justify-between">
              <h2 className="text-[16px] md:text-[18px] font-normal text-[rgba(30,50,90,0.95)]">Room workspace</h2>
              <span className="text-[12px] text-[rgba(30,50,90,0.55)]">{rooms.length} rooms</span>
            </div>

            {rooms.length === 0 ? (
              <div className="px-5 md:px-7 py-12 text-center">
                <p className="text-[15px] md:text-[17px] text-[rgba(30,50,90,0.8)]">No room captures yet</p>
                <p className="mt-2 text-[12px] md:text-[13px] text-[rgba(30,50,90,0.55)]">
                  Start with one photo to create your first spatial workspace.
                </p>
              </div>
            ) : (
              rooms.map((room, i) => (
                <Link href={`/room/${room.id}`} key={room.id} className="block">
                  <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 * i }}
                  className="group px-5 md:px-7 py-5 border-b border-[rgba(30,50,90,0.06)] last:border-b-0 flex items-center gap-4 md:gap-6 hover:bg-white/40 transition-colors cursor-pointer"
                >
                  <span className="hidden sm:block text-[12px] text-[rgba(30,50,90,0.45)] w-14 shrink-0">{room.id}</span>

                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] md:text-[17px] font-normal text-[rgba(30,50,90,0.95)] truncate">{room.name}</p>
                    <p className="text-[12px] text-[rgba(30,50,90,0.55)]">
                      {room.objectsRemoved} erased · {room.itemsPlaced} placed · {formatCapturedAt(room.capturedAt)}
                    </p>
                  </div>

                  <span className={`hidden md:inline-block text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full ${statusStyles[room.status]}`}>
                    {statusLabel[room.status]}
                  </span>

                  <div className="bg-[rgba(30,50,90,0.05)] w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center border border-[rgba(30,50,90,0.1)] shrink-0 group-hover:bg-[rgba(30,50,90,0.1)] transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-[rgba(30,50,90,0.8)]" />
                  </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
