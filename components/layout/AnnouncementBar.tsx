"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ANNOUNCEMENTS } from "@/lib/constants"

/** Top-of-site offer strip. Rotates through ANNOUNCEMENTS every 4s. */
export function AnnouncementBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (ANNOUNCEMENTS.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-[#2a1f14] text-[#f5e6d3] h-8 flex items-center justify-center overflow-hidden px-4" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[11px] md:text-xs tracking-[0.08em] font-medium truncate"
        >
          {ANNOUNCEMENTS[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
