"use client"

import { useState, useEffect } from "react"
import { LaunchCountdown } from "@/components/home/LaunchCountdown"

const LAUNCH_DATE = new Date("2025-07-07T09:00:00+05:30")

export function HomePageWrapper({ children }: { children: React.ReactNode }) {
  const [isLaunched, setIsLaunched] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setIsLaunched(new Date() >= LAUNCH_DATE)
    setChecked(true)
    const timer = setInterval(() => {
      if (new Date() >= LAUNCH_DATE) {
        setIsLaunched(true)
        clearInterval(timer)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!checked) return null

  if (!isLaunched) return <LaunchCountdown />

  return <>{children}</>
}
