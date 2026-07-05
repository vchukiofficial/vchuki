"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Star } from "lucide-react"
import type { Address } from "@/types"
import { AddressForm, type AddressFormValue } from "@/components/shared/AddressForm"

const emptyAddress: AddressFormValue = { name: "", street: "", city: "", state: "", zip: "", phone: "" }

export default function AddressesPage() {
  const { data: session } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AddressFormValue>(emptyAddress)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session) {
      fetch("/api/users/me/addresses")
        .then((r) => r.json())
        .then((data) => setAddresses(data.addresses || []))
    }
  }, [session])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/users/me/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setAddresses(data.addresses)
      setShowForm(false)
      setForm(emptyAddress)
    }
    setSaving(false)
  }

  async function handleDelete(addressId: string) {
    const res = await fetch(`/api/users/me/addresses?addressId=${addressId}`, { method: "DELETE" })
    if (res.ok) {
      const data = await res.json()
      setAddresses(data.addresses)
    }
  }

  async function handleSetDefault(addressId: string) {
    const res = await fetch("/api/users/me/addresses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId }),
    })
    if (res.ok) {
      const data = await res.json()
      setAddresses(data.addresses)
    }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Addresses</h1>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="p-4 rounded-lg border border-border/50 bg-card/50 mb-6 space-y-4">
          <AddressForm value={form} onChange={setForm} />
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving..." : "Save Address"}
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div key={addr._id} className="p-4 rounded-lg border border-border/50 bg-card/50 flex justify-between">
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <p className="font-medium">{addr.name}</p>
                {addr.isDefault && (
                  <span className="text-[10px] uppercase tracking-wider text-[#c4956a] font-medium border border-[#c4956a]/30 px-1.5 py-0.5">Default</span>
                )}
              </div>
              <p className="text-muted-foreground">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
              <p className="text-muted-foreground">{addr.phone}</p>
              {!addr.isDefault && (
                <button
                  onClick={() => addr._id && handleSetDefault(addr._id)}
                  className="mt-1 flex items-center gap-1 text-xs text-[#c4956a] hover:underline"
                >
                  <Star className="h-3 w-3" /> Set as default
                </button>
              )}
            </div>
            <button onClick={() => addr._id && handleDelete(addr._id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {addresses.length === 0 && !showForm && (
          <p className="text-muted-foreground text-center py-8">No addresses saved.</p>
        )}
      </div>
    </div>
  )
}
