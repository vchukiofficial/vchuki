"use client"

import { X, Ruler, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const SIZE_DATA = [
  { size: "S", shoulder: '16.5"', chest: '41.5"', length: '29"' },
  { size: "M", shoulder: '17.25"', chest: '43.5"', length: '29.5"' },
  { size: "L", shoulder: '18"', chest: '45.5"', length: '30"' },
  { size: "XL", shoulder: '19"', chest: '48.5"', length: '31"' },
  { size: "XXL", shoulder: '20"', chest: '51.5"', length: '32"' },
]

interface SizeGuideProps {
  isOpen: boolean
  onClose: () => void
}

export function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-background border border-border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[#c4956a]" />
                <h2 className="text-sm font-medium text-foreground">Size Guide</h2>
              </div>
              <button onClick={onClose} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Size Chart */}
            <div className="p-4 space-y-4">
              <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium">Finished Garment Measurements (Inches)</p>
              <div className="border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#2a1f14] dark:bg-[#c4956a]/20">
                      <th className="p-2.5 text-left text-[10px] uppercase tracking-wider text-[#f5e6d3] dark:text-[#c4956a] font-medium">Size</th>
                      <th className="p-2.5 text-center text-[10px] uppercase tracking-wider text-[#f5e6d3] dark:text-[#c4956a] font-medium">Shoulder</th>
                      <th className="p-2.5 text-center text-[10px] uppercase tracking-wider text-[#f5e6d3] dark:text-[#c4956a] font-medium">Chest</th>
                      <th className="p-2.5 text-center text-[10px] uppercase tracking-wider text-[#f5e6d3] dark:text-[#c4956a] font-medium">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {SIZE_DATA.map((row, i) => (
                      <tr key={row.size} className={i % 2 === 0 ? "bg-card/50" : ""}>
                        <td className="p-2.5 font-medium text-foreground">{row.size}</td>
                        <td className="p-2.5 text-center text-muted-foreground">{row.shoulder}</td>
                        <td className="p-2.5 text-center text-muted-foreground">{row.chest}</td>
                        <td className="p-2.5 text-center text-muted-foreground">{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-[#c4956a]/5 border border-[#c4956a]/20 space-y-1">
                <p className="text-[10px] font-medium text-foreground flex items-center gap-1.5"><Info className="h-3 w-3 text-[#c4956a]" /> Note</p>
                <p className="text-[10px] text-muted-foreground">All measurements are of the finished garment. If between sizes, go one size up for relaxed fit.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
