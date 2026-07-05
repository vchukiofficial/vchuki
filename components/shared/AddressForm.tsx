"use client"

import { useEffect, useRef, useState } from "react"
import { Navigation, Loader2 } from "lucide-react"

export interface AddressFormValue {
  name: string
  street: string
  city: string
  state: string
  zip: string
  phone: string
}

interface AddressFormProps {
  value: AddressFormValue
  onChange: (value: AddressFormValue) => void
  /** Show the phone field. Checkout collects phone separately in some layouts. */
  showPhone?: boolean
}

export function AddressForm({ value, onChange, showPhone = true }: AddressFormProps) {
  const [pinLookupState, setPinLookupState] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [geoState, setGeoState] = useState<"idle" | "loading" | "error">("idle")
  const [geoError, setGeoError] = useState("")
  const lastLookedUpPin = useRef<string>("")

  function update(field: keyof AddressFormValue, raw: string) {
    let next = raw
    if (field === "phone") {
      next = raw.replace(/\D/g, "").slice(0, 10)
    }
    if (field === "zip") {
      next = raw.replace(/\D/g, "").slice(0, 6)
    }
    onChange({ ...value, [field]: next })
  }

  useEffect(() => {
    if (value.zip.length !== 6 || value.zip === lastLookedUpPin.current) return

    const timeout = setTimeout(async () => {
      setPinLookupState("loading")
      try {
        const res = await fetch(`/api/location/pincode/${value.zip}`)
        const data = await res.json()
        lastLookedUpPin.current = value.zip
        if (data.valid) {
          onChange({ ...value, city: data.city, state: data.state })
          setPinLookupState("done")
        } else {
          setPinLookupState("error")
        }
      } catch {
        setPinLookupState("error")
      }
    }, 400)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.zip])

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoState("error")
      setGeoError("Geolocation isn't supported on this browser.")
      return
    }
    setGeoState("loading")
    setGeoError("")
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const res = await fetch(`/api/location/reverse-geocode?lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          if (data.valid) {
            onChange({
              ...value,
              street: data.street || value.street,
              city: data.city || value.city,
              state: data.state || value.state,
              zip: data.zip || value.zip,
            })
            lastLookedUpPin.current = data.zip || lastLookedUpPin.current
            setGeoState("idle")
          } else {
            setGeoState("error")
            setGeoError("Couldn't detect your address — please enter it manually.")
          }
        } catch {
          setGeoState("error")
          setGeoError("Couldn't detect your address — please enter it manually.")
        }
      },
      (err) => {
        setGeoState("error")
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — please enter your address manually."
            : "Couldn't detect your location — please enter it manually."
        )
      },
      { timeout: 10000 }
    )
  }

  const fieldClass =
    "w-full mt-1 px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={useMyLocation}
        disabled={geoState === "loading"}
        className="flex items-center gap-1.5 text-xs text-[#c4956a] font-medium hover:underline disabled:opacity-50"
      >
        {geoState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
        {geoState === "loading" ? "Detecting your location…" : "Use my current location"}
      </button>
      {geoState === "error" && <p className="text-xs text-destructive">{geoError}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Full Name</label>
          <input
            type="text"
            value={value.name}
            onChange={(e) => update("name", e.target.value)}
            required
            placeholder="Your full name"
            className={fieldClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Street Address</label>
          <input
            type="text"
            value={value.street}
            onChange={(e) => update("street", e.target.value)}
            required
            placeholder="House no, Street, Locality"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">PIN Code</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={value.zip}
              onChange={(e) => update("zip", e.target.value)}
              required
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="342001"
              className={fieldClass}
            />
            {pinLookupState === "loading" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            )}
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">City</label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => update("city", e.target.value)}
            required
            placeholder="City"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">State</label>
          <input
            type="text"
            value={value.state}
            onChange={(e) => update("state", e.target.value)}
            required
            placeholder="State"
            className={fieldClass}
          />
        </div>
        {showPhone && (
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Phone</label>
            <div className="flex mt-1">
              <span className="px-3 py-3 border border-r-0 border-border bg-muted text-sm text-muted-foreground">+91</span>
              <input
                type="tel"
                value={value.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
                pattern="[0-9]{10}"
                maxLength={10}
                placeholder="9252891189"
                className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[#c4956a]/50 transition-colors text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
