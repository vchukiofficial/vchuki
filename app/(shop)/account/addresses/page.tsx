"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"
import type { Address } from "@/types"

export default function AddressesPage() {
  const { data: session } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (session) {
      fetch("/api/users/me/addresses")
        .then((r) => r.json())
        .then((data) => setAddresses(data.addresses || []))
    }
  }, [session])

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const address = Object.fromEntries(fd.entries())
    const res = await fetch("/api/users/me/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address),
    })
    if (res.ok) {
      const data = await res.json()
      setAddresses(data.addresses)
      setShowForm(false)
    }
  }

  async function handleDelete(index: number) {
    const res = await fetch(`/api/users/me/addresses?index=${index}`, { method: "DELETE" })
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
        <form onSubmit={handleAdd} className="p-4 rounded-lg border border-border/50 bg-card/50 mb-6 grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Name</Label><Input name="name" required /></div>
          <div className="col-span-2"><Label>Street</Label><Input name="street" required /></div>
          <div><Label>City</Label><Input name="city" required /></div>
          <div><Label>State</Label><Input name="state" required /></div>
          <div><Label>PIN Code</Label><Input name="zip" required /></div>
          <div><Label>Phone</Label><Input name="phone" required /></div>
          <div className="col-span-2"><Button type="submit" size="sm">Save Address</Button></div>
        </form>
      )}

      <div className="space-y-3">
        {addresses.map((addr, i) => (
          <div key={i} className="p-4 rounded-lg border border-border/50 bg-card/50 flex justify-between">
            <div className="text-sm">
              <p className="font-medium">{addr.name}</p>
              <p className="text-muted-foreground">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
              <p className="text-muted-foreground">{addr.phone}</p>
            </div>
            <button onClick={() => handleDelete(i)} className="text-muted-foreground hover:text-destructive">
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
