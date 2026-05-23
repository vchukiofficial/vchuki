"use client"

import { useEffect, useState } from "react"
import { Users, Crown, ShoppingCart, Clock, RefreshCw } from "lucide-react"

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  function fetchUsers() {
    setLoading(true)
    setError("")
    fetch("/api/users", { credentials: "include", cache: "no-store" })
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch")
        return r.json()
      })
      .then(d => { setUsers(d.users || []); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  useEffect(() => { fetchUsers() }, [])

  async function toggleRole(id: string, role: string) {
    const newRole = role === "admin" ? "user" : "admin"
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role: newRole }),
    })
    setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u))
  }

  const admins = users.filter(u => u.role === "admin")
  const customers = users.filter(u => u.role === "user")

  if (loading) return <div className="text-sm text-muted-foreground p-4">Loading customers...</div>
  if (error) return <div className="text-sm text-red-500 p-4">Error: {error}. Make sure you&apos;re logged in as admin.</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Customers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{users.length} registered users</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 border border-border bg-card">
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total</span></div>
          <p className="text-2xl font-light mt-2 text-foreground">{users.length}</p>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="flex items-center gap-2"><Crown className="h-4 w-4 text-[#c4956a]" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Admins</span></div>
          <p className="text-2xl font-light mt-2 text-foreground">{admins.length}</p>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-blue-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Customers</span></div>
          <p className="text-2xl font-light mt-2 text-foreground">{customers.length}</p>
        </div>
        <div className="p-4 border border-border bg-card">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">This Month</span></div>
          <p className="text-2xl font-light mt-2 text-foreground">{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 86400000)).length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-card">
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Customer</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Email</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Role</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Joined</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-card/50 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#c4956a]/10 flex items-center justify-center text-[10px] font-bold text-[#c4956a]">{user.name?.charAt(0)}</div>
                    <span className="font-medium text-foreground text-sm">{user.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{user.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium ${user.role === "admin" ? "bg-[#c4956a]/10 text-[#c4956a]" : "bg-muted text-muted-foreground"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="p-3">
                  <button onClick={() => toggleRole(user._id, user.role)} className="text-[10px] px-2.5 py-1 border border-border hover:border-[#c4956a]/30 transition-colors text-foreground font-medium">
                    {user.role === "admin" ? "Revoke Admin" : "Make Admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No users found. Try refreshing.
        </div>
      )}
    </div>
  )
}
