"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, ZoomIn, ZoomOut, Move, RotateCcw, Download, FlipHorizontal } from "lucide-react"

interface VirtualTryOnProps {
  isOpen: boolean
  onClose: () => void
  shirtImage: string
  productName: string
}

export function VirtualTryOn({ isOpen, onClose, shirtImage, productName }: VirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [error, setError] = useState("")
  const [mirrored, setMirrored] = useState(true)

  // Shirt overlay controls
  const [shirtPos, setShirtPos] = useState({ x: 0, y: 0 })
  const [shirtScale, setShirtScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        setCameraReady(true)
      }
      setStream(mediaStream)
    } catch {
      setError("Camera access denied. Please allow camera permission.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setCameraReady(false)
  }, [stream])

  useEffect(() => {
    if (isOpen) startCamera()
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function handlePointerDown(e: React.PointerEvent) {
    setIsDragging(true)
    setDragStart({ x: e.clientX - shirtPos.x, y: e.clientY - shirtPos.y })
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return
    setShirtPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  function handlePointerUp() {
    setIsDragging(false)
  }

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (mirrored) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)
    if (mirrored) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }

    // Download
    const link = document.createElement("a")
    link.download = `vchuki-tryon-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  function reset() {
    setShirtPos({ x: 0, y: 0 })
    setShirtScale(1)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-black/80 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-[#c4956a]" />
                <span className="text-xs text-white/80 font-medium">Virtual Try-On</span>
                <span className="text-[9px] text-white/40 hidden md:inline">— {productName}</span>
              </div>
              <button onClick={() => { stopCamera(); onClose() }} className="h-7 w-7 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Camera View */}
            <div
              className="flex-1 relative overflow-hidden touch-none"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${mirrored ? "scale-x-[-1]" : ""}`}
              />

              {/* Shirt Overlay */}
              {cameraReady && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ transform: `translate(${shirtPos.x}px, ${shirtPos.y}px)` }}
                >
                  <div
                    className="relative pointer-events-auto cursor-move"
                    style={{ width: `${280 * shirtScale}px`, height: `${360 * shirtScale}px` }}
                    onPointerDown={handlePointerDown}
                  >
                    <Image
                      src={shirtImage}
                      alt="Try-on overlay"
                      fill
                      className="object-contain opacity-80 drop-shadow-2xl"
                      sizes="300px"
                      draggable={false}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center p-6">
                    <Camera className="h-8 w-8 text-white/30 mx-auto mb-3" />
                    <p className="text-sm text-white/80">{error}</p>
                    <button onClick={startCamera} className="mt-4 px-4 py-2 bg-[#c4956a] text-[#2a1f14] text-xs font-medium">
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions overlay (shows briefly) */}
              {cameraReady && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 3, duration: 1 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-black/60 backdrop-blur-sm px-4 py-3 text-center">
                    <Move className="h-5 w-5 text-white/80 mx-auto mb-1" />
                    <p className="text-[10px] text-white/80 uppercase tracking-wider">Drag shirt to position</p>
                    <p className="text-[9px] text-white/50 mt-0.5">Use +/- to resize</p>
                  </div>
                </motion.div>
              )}

              {/* Hidden canvas for capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between p-3 bg-black/80 border-t border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => setShirtScale(s => Math.max(0.4, s - 0.1))} className="h-8 w-8 border border-white/20 flex items-center justify-center text-white/60 hover:text-white">
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setShirtScale(s => Math.min(2, s + 0.1))} className="h-8 w-8 border border-white/20 flex items-center justify-center text-white/60 hover:text-white">
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setMirrored(!mirrored)} className="h-8 w-8 border border-white/20 flex items-center justify-center text-white/60 hover:text-white">
                  <FlipHorizontal className="h-3.5 w-3.5" />
                </button>
                <button onClick={reset} className="h-8 w-8 border border-white/20 flex items-center justify-center text-white/60 hover:text-white">
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Scale indicator */}
              <span className="text-[9px] text-white/40 font-mono">{Math.round(shirtScale * 100)}%</span>

              {/* Capture */}
              <button onClick={handleCapture} className="flex items-center gap-1.5 px-4 py-2 bg-[#c4956a] text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider">
                <Download className="h-3 w-3" /> Capture
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
