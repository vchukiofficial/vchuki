"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react"

const FALLBACK_VIDEO = "/VCHUKI_–_QUIET_LUXURY_GRWM_REE (2).mp4"

interface HeroVideo {
  _id: string
  title: string
  url: string
  order: number
}

export function HeroVideoCarousel() {
  const [videos, setVideos] = useState<HeroVideo[]>([])
  const [current, setCurrent] = useState(0)
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetch("/api/admin/hero-videos")
      .then((r) => r.json())
      .then((data) => {
        const active = (data.videos || []).filter((v: any) => v.isActive)
        setVideos(active.length > 0 ? active : [{ _id: "fallback", title: "VCHUKI", url: FALLBACK_VIDEO, order: 0 }])
      })
      .catch(() => {
        setVideos([{ _id: "fallback", title: "VCHUKI", url: FALLBACK_VIDEO, order: 0 }])
      })
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [current])

  const next = () => setCurrent((p) => (p + 1) % videos.length)
  const prev = () => setCurrent((p) => (p - 1 + videos.length) % videos.length)

  if (videos.length === 0) {
    return (
      <div className="relative w-full aspect-[9/16] md:aspect-video max-h-[70vh] bg-[#2a1f14] flex items-center justify-center">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src={FALLBACK_VIDEO} type="video/mp4" />
        </video>
      </div>
    )
  }

  return (
    <section className="relative w-full aspect-[9/16] md:aspect-video max-h-[70vh] overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={muted}
        playsInline
        className="w-full h-full object-cover"
        onEnded={videos.length > 1 ? next : undefined}
      >
        <source src={videos[current]?.url || FALLBACK_VIDEO} type="video/mp4" />
      </video>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

      {/* Controls */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-4">
        <button onClick={() => setMuted(!muted)} className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white">
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {videos.length > 1 && (
          <div className="flex items-center gap-3">
            <button onClick={prev} className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {videos.map((_, idx) => (
                <button key={idx} onClick={() => setCurrent(idx)} className={`h-1.5 rounded-full transition-all ${idx === current ? "w-6 bg-[#c4956a]" : "w-1.5 bg-white/40"}`} />
              ))}
            </div>
            <button onClick={next} className="p-2 bg-black/40 backdrop-blur-sm rounded-full text-white/80 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
