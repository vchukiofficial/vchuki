"use client"

import { useEffect, useState } from "react"
import { Users, Crown, ShoppingCart, Clock, RefreshCw, Trash2, Download } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function fetchUsers() {
    setLoading(true)
    setError("")
    fetch("/api/users", { credentials: "include", cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error("Failed"); return r.json() })
      .then(d => { setUsers(d.users || []); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  useEffect(() => { fetchUsers() }, [])

  function toggleSelect(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function toggleAll() {
    if (selected.size === users.length) setSelected(new Set())
    else setSelected(new Set(users.map(u => u._id)))
  }

  async function toggleRole(id: string, role: string) {
    const newRole = role === "admin" ? "user" : "admin"
    await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ role: newRole }) })
    setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u))
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} user(s)? This cannot be undone.`)) return
    for (const id of selected) {
      await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" })
    }
    setUsers(users.filter(u => !selected.has(u._id)))
    setSelected(new Set())
  }

  async function handleExport() {
    const exportData = users.map(u => ({
      name: u.name,
      email: u.email,
      role: u.role,
      joined: new Date(u.createdAt).toLocaleDateString("en-IN"),
    }))
    await exportToExcel({
      title: "Customers Report",
      sheetName: "Customers",
      filename: "VCHUKI_Customers",
      columns: [
        { header: "Name", key: "name", width: 22 },
        { header: "Email", key: "email", width: 28 },
        { header: "Role", key: "role", width: 10 },
        { header: "Joined", key: "joined", width: 14 },
      ],
      data: exportData,
    })
  }

  const admins = users.filter(u => u.role === "admin")
  const customers = users.filter(u => u.role === "user")

  if (loading) return <div className="text-sm text-muted-foreground p-4">Loading customers...</div>
  if (error) return <div className="text-sm text-red-500 p-4">Error: {error}</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Customers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{users.length} registered users</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-red-600 transition-colors">
              <Trash2 className="h-3 w-3" /> Delete ({selected.size})
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <Download className="h-3 w-3" /> Export Excel
          </button>
          <button onClick={fetchUsers} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 border border-border bg-card"><div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span></div><p className="text-xl font-light text-foreground mt-1">{users.length}</p></div>
        <div className="p-3 border border-border bg-card"><div className="flex items-center gap-2"><Crown className="h-3.5 w-3.5 text-[#c4956a]" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Admins</span></div><p className="text-xl font-light text-foreground mt-1">{admins.length}</p></div>
        <div className="p-3 border border-border bg-card"><div className="flex items-center gap-2"><ShoppingCart className="h-3.5 w-3.5 text-blue-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Customers</span></div><p className="text-xl font-light text-foreground mt-1">{customers.length}</p></div>
        <div className="p-3 border border-border bg-card"><div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-emerald-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">This Month</span></div><p className="text-xl font-light text-foreground mt-1">{users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30 * 86400000)).length}</p></div>
      </div>

      {/* Table */}
      <div className="border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-card">
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-3 w-8"><input type="checkbox" checked={selected.size === users.length && users.length > 0} onChange={toggleAll} className="accent-[#c4956a]" /></th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Customer</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Email</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Role</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Joined</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user._id} className={`transition-colors ${selected.has(user._id) ? "bg-[#c4956a]/5" : "hover:bg-card/50"}`}>
                <td className="p-3"><input type="checkbox" checked={selected.has(user._id)} onChange={() => toggleSelect(user._id)} className="accent-[#c4956a]" /></td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#c4956a]/10 flex items-center justify-center text-[10px] font-bold text-[#c4956a]">{user.name?.charAt(0)}</div>
                    <span className="font-medium text-foreground text-sm">{user.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{user.email}</td>
                <td className="p-3"><span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium ${user.role === "admin" ? "bg-[#c4956a]/10 text-[#c4956a]" : "bg-muted text-muted-foreground"}`}>{user.role}</span></td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="p-3"><button onClick={() => toggleRole(user._id, user.role)} className="text-[10px] px-2.5 py-1 border border-border hover:border-[#c4956a]/30 transition-colors text-foreground font-medium">{user.role === "admin" ? "Revoke" : "Make Admin"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
