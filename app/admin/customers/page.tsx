"use client"

import { useEffect, useState } from "react"
import { Users, Crown, ShoppingCart, Clock } from "lucide-react"

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(d => { setUsers(d.users || []); setLoading(false) })
  }, [])

  async function toggleRole(id: string, role: string) {
    const newRole = role === "admin" ? "user" : "admin"
    await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) })
    setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u))
  }

  const admins = users.filter(u => u.role === "admin")
  const customers = users.filter(u => u.role === "user")

  if (loading) return <div className="text-sm text-muted-foreground">Loading customers...</div>

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{users.length} registered users</p>
      </div>

      {/* Segments */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border bg-card"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Total</span></div><p className="text-lg font-semibold mt-1">{users.length}</p></div>
        <div className="p-3 rounded-lg border bg-card"><div className="flex items-center gap-2"><Crown className="h-4 w-4 text-accent" /><span className="text-xs text-muted-foreground">Admins</span></div><p className="text-lg font-semibold mt-1">{admins.length}</p></div>
        <div className="p-3 rounded-lg border bg-card"><div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-blue-500" /><span className="text-xs text-muted-foreground">Buyers</span></div><p className="text-lg font-semibold mt-1">{customers.length}</p></div>
        <div className="p-3 rounded-lg border bg-card"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-green-500" /><span className="text-xs text-muted-foreground">This Month</span></div><p className="text-lg font-semibold mt-1">{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30*86400000)).length}</p></div>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium hidden md:table-cell">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium hidden md:table-cell">Joined</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-foreground/5 flex items-center justify-center text-[10px] font-medium">{user.name?.charAt(0)}</div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{user.email}</td>
                <td className="p-3"><span className={`px-1.5 py-0.5 rounded text-[10px] ${user.role === "admin" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{user.role}</span></td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button onClick={() => toggleRole(user._id, user.role)} className="text-[10px] px-2 py-1 rounded border hover:bg-muted transition-colors">
                    {user.role === "admin" ? "Revoke" : "Make Admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
