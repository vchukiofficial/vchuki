"use client"

import { useEffect, useRef } from "react"
import { AlertTriangle, Trash2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  const iconConfig = {
    danger: { icon: Trash2, bg: "bg-red-500/10", text: "text-red-500" },
    warning: { icon: AlertTriangle, bg: "bg-amber-500/10", text: "text-amber-500" },
    info: { icon: AlertTriangle, bg: "bg-blue-500/10", text: "text-blue-500" },
  }

  const btnConfig = {
    danger: "bg-red-500 hover:bg-red-600 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    info: "bg-blue-500 hover:bg-blue-600 text-white",
  }

  const config = iconConfig[variant]
  const Icon = config.icon

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm mx-4 bg-background border border-border shadow-2xl"
          >
            {/* Close */}
            <button onClick={onClose} className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="p-6 text-center">
              {/* Icon */}
              <div className={`h-12 w-12 mx-auto rounded-full ${config.bg} flex items-center justify-center mb-4`}>
                <Icon className={`h-5 w-5 ${config.text}`} />
              </div>

              {/* Content */}
              <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{description}</p>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-9 border border-border text-xs font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  ref={confirmRef}
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 h-9 text-xs font-medium tracking-wide transition-colors disabled:opacity-50 ${btnConfig[variant]}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
