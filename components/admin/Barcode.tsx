"use client"

import { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"

/** Code128 barcode as crisp SVG — prints sharply on thermal label printers. */
export function Barcode({ value, height = 40, width = 1.4, fontSize = 11 }: { value: string; height?: number; width?: number; fontSize?: number }) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!ref.current || !value) return
    try {
      JsBarcode(ref.current, value, { format: "CODE128", height, width, fontSize, margin: 0, textMargin: 1, background: "transparent" })
    } catch { /* invalid characters — leave blank */ }
  }, [value, height, width, fontSize])

  return <svg ref={ref} className="max-w-full" />
}
