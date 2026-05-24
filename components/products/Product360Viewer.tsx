"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCw, ZoomIn, Maximize2 } from "lucide-react"

interface ProductViewerProps {
  images: {
    front: string
    left?: string
    right?: string
    back?: string
  }
  alt: string
  className?: string
}

const ANGLES = ["front", "left", "back", "right"] as const
type Angle = typeof ANGLES[number]

export function Product360Viewer({ images, alt, className = "" }: ProductViewerProps) {
  const [currentAngle, setCurrentAngle] = useState<Angle>("front")
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const availableAngles = ANGLES.filter(a => images[a])

  function handleMouseMove(e: React.MouseEvent) {
    if (!isZoomed || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  function handleDrag(e: React.MouseEvent) {
    if (isZoomed) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const idx = Math.floor(x * availableAngles.length)
    const angle = availableAngles[Math.min(idx, availableAngles.length - 1)]
    if (angle && angle !== currentAngle) setCurrentAngle(angle)
  }

  function nextAngle() {
    const idx = availableAngles.indexOf(currentAngle)
    setCurrentAngle(availableAngles[(idx + 1) % availableAngles.length])
  }

  const currentImage = images[currentAngle] || images.front

  return (
    <div className={`relative ${className}`}>
      {/* Main viewer */}
      <div
        ref={containerRef}
        className="relative aspect-[3/4] bg-gradient-to-b from-card/50 to-background border border-border overflow-hidden cursor-crosshair group"
        onMouseMove={isZoomed ? handleMouseMove : handleDrag}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAngle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={currentImage}
              alt={`${alt} - ${currentAngle} view`}
              fill
              className={`object-contain transition-transform duration-300 ${isZoomed ? "scale-[2]" : ""}`}
              style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom indicator */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed) }} className="h-7 w-7 bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            {isZoomed ? <Maximize2 className="h-3 w-3" /> : <ZoomIn className="h-3 w-3" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); nextAngle() }} className="h-7 w-7 bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <RotateCw className="h-3 w-3" />
          </button>
        </div>

        {/* Drag hint */}
        {availableAngles.length > 1 && !isZoomed && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-background/80 backdrop-blur-sm border border-border text-[9px] text-muted-foreground uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            Drag to rotate · Click to zoom
          </div>
        )}

        {/* Current angle label */}
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-background/80 backdrop-blur-sm border border-border text-[9px] text-muted-foreground uppercase tracking-wider font-medium">
          {currentAngle}
        </div>
      </div>

      {/* Angle thumbnails */}
      {availableAngles.length > 1 && (
        <div className="flex gap-2 mt-3">
          {availableAngles.map(angle => (
            <button
              key={angle}
              onClick={() => setCurrentAngle(angle)}
              className={`relative w-16 h-20 border overflow-hidden transition-colors ${currentAngle === angle ? "border-[#c4956a]" : "border-border hover:border-[#c4956a]/40"}`}
            >
              <Image
                src={images[angle]!}
                alt={`${alt} - ${angle}`}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
              <span className="absolute bottom-0 left-0 right-0 bg-background/80 text-[8px] text-center uppercase tracking-wider text-muted-foreground py-0.5">
                {angle}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
