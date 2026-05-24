"use client"

import { useState } from "react"
import { X, Ruler, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const SIZE_DATA = [
  { size: "S", shoulder: '16.5"', chest: '41.5"', length: '29"' },
  { size: "M", shoulder: '17.25"', chest: '43.5"', length: '29.5"' },
  { size: "L", shoulder: '18"', chest: '45.5"', length: '30"' },
  { size: "XL", shoulder: '19"', chest: '48.5"', length: '31"' },
  { size: "XXL", shoulder: '20"', chest: '51.5"', length: '32"' },
]

const HOW_TO_MEASURE = [
  { part: "Shoulder", desc: "Measure from one shoulder point to another across the back" },
  { part: "Chest", desc: "Measure the broadest part of your chest, keeping tape horizontal" },
  { part: "Length", desc: "Measure from HPS (High Point Shoulder) to the bottom hem" },
]

const KEY_MEASUREMENTS = {
  XL: { shoulder: '19"', chest: '48.5"', length: '31"', sleeveHalf: '10.5"', sleeveFull: '24.5"', cuff: '9"', collar: '18"' },
  XXL: { shoulder: '20"', chest: '51.5"', length: '32"', sleeveHalf: '10.5"', sleeveFull: '25"', cuff: '10"', collar: '20"' },
}

const STYLE_FEATURES = [
  "Spread Collar",
  "Back Yoke",
  "Curved Bottom",
  "Regular Fit",
  "Single Pocket",
  "Placket Front",
  "Double Needle Stitch",
]

interface SizeGuideProps {
  isOpen: boolean
  onClose: () => void
}

export function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  const [activeTab, setActiveTab] = useState<"chart" | "measure" | "details">("chart")

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] md:max-h-[85vh] bg-background border border-border z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-[#c4956a]" />
                <h2 className="text-sm font-medium text-foreground">Size Guide</h2>
              </div>
              <button onClick={onClose} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border flex-shrink-0">
              {([["chart", "Size Chart"], ["measure", "How to Measure"], ["details", "Style Details"]] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 py-2.5 text-[10px] uppercase tracking-wider font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#c4956a] text-foreground" : "border-transparent text-muted-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {activeTab === "chart" && (
                <>
                  {/* Size Chart Table */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-3">Finished Garment Size Chart (Inches)</p>
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
                  </div>

                  {/* Size Grading */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-3">Size Grading (Increase/Decrease from L)</p>
                    <div className="border border-border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-card">
                            <th className="p-2 text-left text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Size</th>
                            <th className="p-2 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Chest</th>
                            <th className="p-2 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Shoulder</th>
                            <th className="p-2 text-center text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Length</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {[
                            { size: "S", chest: "-4\"", shoulder: "-1.5\"", length: "-1\"" },
                            { size: "M", chest: "-2\"", shoulder: "-0.75\"", length: "-0.5\"" },
                            { size: "L", chest: "0", shoulder: "0", length: "0" },
                            { size: "XL", chest: "+3\"", shoulder: "+1\"", length: "+1\"" },
                            { size: "2XL", chest: "+6\"", shoulder: "+2\"", length: "+2\"" },
                          ].map(row => (
                            <tr key={row.size}>
                              <td className="p-2 font-medium text-foreground">{row.size}</td>
                              <td className="p-2 text-center text-muted-foreground">{row.chest}</td>
                              <td className="p-2 text-center text-muted-foreground">{row.shoulder}</td>
                              <td className="p-2 text-center text-muted-foreground">{row.length}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="p-3 bg-[#c4956a]/5 border border-[#c4956a]/20 space-y-1.5">
                    <p className="text-[10px] font-medium text-foreground flex items-center gap-1.5"><Info className="h-3 w-3 text-[#c4956a]" /> Measurement Notes</p>
                    <ul className="text-[10px] text-muted-foreground space-y-0.5 list-disc list-inside">
                      <li>All measurements are of the finished garment</li>
                      <li>Ease included in chest (4&quot; to 5&quot; extra from body chest)</li>
                      <li>Chest grading is total chest, shoulder grading is total shoulder</li>
                      <li>Length grading is from HPS (High Point Shoulder)</li>
                    </ul>
                  </div>
                </>
              )}

              {activeTab === "measure" && (
                <>
                  {/* How to Measure */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-4">How to Measure</p>
                    <div className="space-y-4">
                      {HOW_TO_MEASURE.map((item, i) => (
                        <div key={item.part} className="flex gap-3">
                          <div className="h-7 w-7 rounded-full bg-[#c4956a]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#c4956a]">{i + 1}</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">{item.part}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Measurements XL */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-3">Key Measurements (XL Size)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(KEY_MEASUREMENTS.XL).map(([key, val]) => (
                        <div key={key} className="flex justify-between p-2 border border-border">
                          <span className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                          <span className="text-[10px] font-medium text-foreground">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seam Allowance */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-3">Seam Allowance</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {[
                        ["Side Seam", "0.5\""], ["Shoulder Seam", "0.5\""],
                        ["Armhole", "0.5\""], ["Neck", "0.25\""],
                        ["Placket (Front)", "2\" fold"], ["Bottom Hem", "1\""],
                        ["Sleeve Hem", "0.75\""], ["Cuff", "0.25\""],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between p-1.5 border-b border-border">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium text-foreground">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="p-3 bg-[#c4956a]/5 border border-[#c4956a]/20">
                    <p className="text-[10px] text-foreground font-medium">Pro Tip</p>
                    <p className="text-[10px] text-muted-foreground mt-1">If you&apos;re between sizes, we recommend going one size up for a relaxed fit or staying true to size for a regular fit. Our linen fabric has a natural drape that accommodates slight variations.</p>
                  </div>
                </>
              )}

              {activeTab === "details" && (
                <>
                  {/* Style Features */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-3">Shirt Style Reference</p>
                    <div className="grid grid-cols-2 gap-2">
                      {STYLE_FEATURES.map(feature => (
                        <div key={feature} className="flex items-center gap-2 p-2 border border-border">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#c4956a]" />
                          <span className="text-[10px] text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fabric Info */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-3">Fabric & Construction</p>
                    <div className="space-y-2 text-[10px]">
                      {[
                        ["Fabric", "100% Premium Linen"],
                        ["Weight", "150-160 GSM"],
                        ["Weave", "Plain Weave"],
                        ["Finish", "Enzyme Washed (Soft)"],
                        ["Shrinkage", "Pre-shrunk (< 2%)"],
                        ["Stitch", "Double Needle, 12 SPI"],
                        ["Buttons", "Natural Shell Buttons"],
                        ["Origin", "Crafted in Jodhpur, Rajasthan"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between p-2 border-b border-border">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium text-foreground">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Care */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium mb-3">Care Instructions</p>
                    <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Machine wash cold (30°C) with similar colors</li>
                      <li>Do not bleach</li>
                      <li>Tumble dry low or line dry in shade</li>
                      <li>Iron on medium heat while slightly damp</li>
                      <li>Linen naturally softens with each wash</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
