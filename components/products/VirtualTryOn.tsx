"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, X, ZoomIn, ZoomOut, RotateCcw, Download, FlipHorizontal, Sparkles, Move, Cpu } from "lucide-react"

interface VirtualTryOnProps {
  isOpen: boolean
  onClose: () => void
  shirtImage: string
  productName: string
}

interface PosePoint {
  x: number
  y: number
  score: number
}

export function VirtualTryOn({ isOpen, onClose, shirtImage, productName }: VirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const detectorRef = useRef<any>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [error, setError] = useState("")
  const [mirrored, setMirrored] = useState(true)
  const [showGuide, setShowGuide] = useState(true)
  const [poseDetected, setPoseDetected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"auto" | "manual">("auto")

  // Auto-detected pose position
  const [autoPose, setAutoPose] = useState<{ x: number; y: number; width: number } | null>(null)

  // Manual override
  const [manualOffset, setManualOffset] = useState({ x: 0, y: 0 })
  const [shirtScale, setShirtScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Load TensorFlow.js and MoveNet
  const loadPoseDetector = useCallback(async () => {
    setLoading(true)
    try {
      const tf = await import("@tensorflow/tfjs")
      await tf.ready()
      const poseDetection = await import("@tensorflow-models/pose-detection")
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      )
      detectorRef.current = detector
      setLoading(false)
    } catch {
      console.warn("Pose detection failed to load, falling back to manual mode")
      setMode("manual")
      setLoading(false)
    }
  }, [])

  // Pose detection loop
  const detectPose = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current || !cameraReady || mode !== "auto") return

    try {
      const poses = await detectorRef.current.estimatePoses(videoRef.current)
      if (poses.length > 0) {
        const keypoints = poses[0].keypoints
        // MoveNet keypoints: 5=left_shoulder, 6=right_shoulder, 11=left_hip, 12=right_hip
        const leftShoulder: PosePoint = keypoints[5]
        const rightShoulder: PosePoint = keypoints[6]
        const leftHip: PosePoint = keypoints[11]
        const rightHip: PosePoint = keypoints[12]

        if (leftShoulder.score > 0.3 && rightShoulder.score > 0.3) {
          const videoEl = videoRef.current
          const scaleX = videoEl.clientWidth / videoEl.videoWidth
          const scaleY = videoEl.clientHeight / videoEl.videoHeight

          // Calculate shoulder midpoint and width
          let sx = ((leftShoulder.x + rightShoulder.x) / 2) * scaleX
          const sy = ((leftShoulder.y + rightShoulder.y) / 2) * scaleY
          const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x) * scaleX

          // Mirror correction
          if (mirrored) sx = videoEl.clientWidth - sx

          // Calculate torso center (between shoulders and hips)
          let torsoY = sy
          if (leftHip.score > 0.3 && rightHip.score > 0.3) {
            const hipY = ((leftHip.y + rightHip.y) / 2) * scaleY
            torsoY = sy + (hipY - sy) * 0.35 // Position shirt slightly below shoulders
          }

          setAutoPose({
            x: sx - videoEl.clientWidth / 2,
            y: torsoY - videoEl.clientHeight / 2 + 20,
            width: shoulderWidth * 1.6, // Shirt is wider than shoulders
          })
          setPoseDetected(true)
        } else {
          setPoseDetected(false)
        }
      }
    } catch { /* silently fail */ }

    animFrameRef.current = requestAnimationFrame(detectPose)
  }, [cameraReady, mode, mirrored])

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 960 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
        setCameraReady(true)
      }
      setStream(mediaStream)
      setTimeout(() => setShowGuide(false), 3500)
    } catch {
      setError("Camera access denied. Please allow camera permission.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setCameraReady(false)
    cancelAnimationFrame(animFrameRef.current)
  }, [stream])

  // Initialize
  useEffect(() => {
    if (isOpen) {
      startCamera()
      loadPoseDetector()
      setManualOffset({ x: 0, y: 0 })
      setShirtScale(1)
    }
    return () => {
      stream?.getTracks().forEach(t => t.stop())
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Start detection loop when camera is ready
  useEffect(() => {
    if (cameraReady && detectorRef.current && mode === "auto") {
      detectPose()
    }
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [cameraReady, mode, detectPose])

  // Drag handlers for manual mode
  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - manualOffset.x, y: e.clientY - manualOffset.y })
    setShowGuide(false)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return
    setManualOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  function handlePointerUp() { setIsDragging(false) }

  // Capture screenshot
  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    if (mirrored) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1) }
    ctx.drawImage(video, 0, 0)
    if (mirrored) ctx.setTransform(1, 0, 0, 1, 0, 0)

    // Overlay shirt
    const shirtImg = new window.Image()
    shirtImg.crossOrigin = "anonymous"
    shirtImg.onload = () => {
      const scaleRatio = canvas.width / (video.clientWidth || 640)
      const pos = getShirtPosition()
      const w = pos.width * scaleRatio
      const h = (pos.width * 1.3) * scaleRatio
      const x = (canvas.width / 2) + (pos.x * scaleRatio) - (w / 2)
      const y = (canvas.height / 2) + (pos.y * scaleRatio) - (h / 3)
      ctx.drawImage(shirtImg, x, y, w, h)

      const link = document.createElement("a")
      link.download = `vchuki-tryon-${Date.now()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
    shirtImg.src = shirtImage
  }

  function getShirtPosition() {
    if (mode === "auto" && autoPose) {
      return {
        x: autoPose.x + manualOffset.x,
        y: autoPose.y + manualOffset.y,
        width: autoPose.width * shirtScale,
      }
    }
    return {
      x: manualOffset.x,
      y: manualOffset.y + 60,
      width: 260 * shirtScale,
    }
  }

  function reset() {
    setManualOffset({ x: 0, y: 0 })
    setShirtScale(1)
  }

  function handleClose() { stopCamera(); onClose() }

  const pos = getShirtPosition()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-[100] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 to-transparent absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#c4956a]/20 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-[#c4956a]" />
              </div>
              <div>
                <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">Virtual Try-On</span>
                <p className="text-[9px] text-white/40">{productName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mode toggle */}
              <button
                onClick={() => setMode(mode === "auto" ? "manual" : "auto")}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-medium transition-colors ${mode === "auto" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/60"}`}
              >
                <Cpu className="h-3 w-3" />
                {mode === "auto" ? "AI Tracking" : "Manual"}
              </button>
              <button onClick={handleClose} className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Status indicator */}
          {mode === "auto" && (
            <div className="absolute top-14 left-4 z-10 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${poseDetected ? "bg-emerald-400 animate-pulse" : loading ? "bg-amber-400 animate-pulse" : "bg-red-400"}`} />
              <span className="text-[9px] text-white/60">
                {loading ? "Loading AI model..." : poseDetected ? "Body detected — auto-tracking" : "Stand in frame for detection"}
              </span>
            </div>
          )}

          {/* Camera View */}
          <div
            className="flex-1 relative overflow-hidden touch-none select-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
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
                style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
              >
                <div
                  className="relative pointer-events-auto cursor-grab active:cursor-grabbing"
                  style={{ width: `${pos.width}px`, height: `${pos.width * 1.3}px` }}
                  onPointerDown={handlePointerDown}
                >
                  <Image
                    src={shirtImage}
                    alt="Virtual try-on"
                    fill
                    className="object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    sizes="350px"
                    draggable={false}
                    unoptimized
                  />
                  {!isDragging && mode === "manual" && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                      <Move className="h-3 w-3 text-white/80" />
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Guide */}
            {cameraReady && showGuide && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-28 left-1/2 -translate-x-1/2 px-5 py-3 bg-black/70 backdrop-blur-md border border-white/10 text-center z-10"
              >
                <p className="text-[11px] text-white font-medium">
                  {mode === "auto" ? "AI is tracking your body — shirt follows automatically" : "Drag the shirt to position on your body"}
                </p>
                <p className="text-[9px] text-white/50 mt-1">You can still drag to fine-tune • +/- to resize</p>
              </motion.div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                <div className="text-center p-8 max-w-sm">
                  <Camera className="h-10 w-10 text-white/20 mx-auto mb-4" />
                  <p className="text-sm text-white/80 mb-2">Camera Access Required</p>
                  <p className="text-xs text-white/40 mb-6">{error}</p>
                  <button onClick={startCamera} className="px-6 py-2.5 bg-[#c4956a] text-[#2a1f14] text-xs font-medium uppercase tracking-wider">
                    Allow Camera
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-6 px-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center gap-1.5">
                <button onClick={() => setShirtScale(s => Math.max(0.5, s - 0.1))} className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:bg-white/20 active:scale-95 transition-all">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button onClick={() => setShirtScale(s => Math.min(1.8, s + 0.1))} className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:bg-white/20 active:scale-95 transition-all">
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button onClick={() => setMirrored(!mirrored)} className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:bg-white/20 active:scale-95 transition-all">
                  <FlipHorizontal className="h-4 w-4" />
                </button>
                <button onClick={reset} className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:bg-white/20 active:scale-95 transition-all">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <button onClick={handleCapture} className="h-14 w-14 rounded-full bg-[#c4956a] flex items-center justify-center shadow-lg shadow-[#c4956a]/30 active:scale-95 transition-transform">
                <div className="h-12 w-12 rounded-full border-2 border-[#2a1f14]/30 flex items-center justify-center">
                  <Download className="h-5 w-5 text-[#2a1f14]" />
                </div>
              </button>

              <span className="text-[9px] text-white/40 font-mono w-16 text-right">{Math.round(shirtScale * 100)}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
