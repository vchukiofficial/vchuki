"use client"

import { useEffect, useState } from "react"
import { Users, Crown, ShoppingCart, Clock, RefreshCw, Trash2, Download, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

const PER_PAGE = 15

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: "single" | "bulk"; id?: string }>({ open: false, type: "bulk" })
  const [deleting, setDeleting] = useState(false)

  function fetchUsers() {
    setLoading(true)
    setError("")
    fetch("/api/users", { credentials: "include", cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error("Failed"); return r.json() })
      .then(d => { setUsers(d.users || []); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }

  useEffect(() => { fetchUsers() }, [])

  // Filtering
  const filtered = users.filter(u => {
    if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false
    if (roleFilter !== "all" && u.role !== roleFilter) return false
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Reset page when filter changes
  useEffect(() => { setPage(1) }, [search, roleFilter])

  function toggleSelect(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function toggleAll() {
    if (selected.size === paginated.length) setSelected(new Set())
    else setSelected(new Set(paginated.map(u => u._id)))
  }

  async function toggleRole(id: string, role: string) {
    const newRole = role === "admin" ? "user" : "admin"
    await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ role: newRole }) })
    setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u))
  }

  async function confirmDelete() {
    setDeleting(true)
    if (deleteDialog.type === "bulk") {
      for (const id of selected) {
        await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" })
      }
      setUsers(users.filter(u => !selected.has(u._id)))
      setSelected(new Set())
    } else if (deleteDialog.id) {
      await fetch(`/api/users/${deleteDialog.id}`, { method: "DELETE", credentials: "include" })
      setUsers(users.filter(u => u._id !== deleteDialog.id))
    }
    setDeleting(false)
    setDeleteDialog({ open: false, type: "bulk" })
  }

  async function handleExport() {
    const exportData = filtered.map(u => ({
      name: u.name, email: u.email, role: u.role,
      joined: new Date(u.createdAt).toLocaleDateString("en-IN"),
    }))
    await exportToExcel({
      title: "Customers Report", sheetName: "Customers", filename: "VCHUKI_Customers",
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

  if (loading) return <div className="text-sm text-muted-foreground p-4 animate-pulse">Loading customers...</div>
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
            <button onClick={() => setDeleteDialog({ open: true, type: "bulk" })} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-red-600">
              <Trash2 className="h-3 w-3" /> Delete ({selected.size})
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <Download className="h-3 w-3" /> Export
          </button>
          <button onClick={fetchUsers} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <RefreshCw className="h-3 w-3" />
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

      {/* Search + Filters */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground placeholder:text-muted-foreground/50" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="h-9 px-3 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50">
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Customers</option>
        </select>
      </div>

      {/* Customers - mobile cards */}
      <div className="md:hidden space-y-2">
        {paginated.map((user) => (
          <div key={user._id} className={`border p-3 ${selected.has(user._id) ? "border-[#c4956a]/30 bg-[#c4956a]/5" : "border-border"}`}>
            <div className="flex items-start gap-2.5">
              <input type="checkbox" checked={selected.has(user._id)} onChange={() => toggleSelect(user._id)} className="accent-[#c4956a] mt-1" />
              <div className="h-8 w-8 rounded-full bg-[#c4956a]/10 flex items-center justify-center text-[10px] font-bold text-[#c4956a] flex-shrink-0">{user.name?.charAt(0)}</div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-medium ${user.role === "admin" ? "bg-[#c4956a]/10 text-[#c4956a]" : "bg-muted text-muted-foreground"}`}>{user.role}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>
            <button onClick={() => toggleRole(user._id, user.role)} className="w-full mt-2.5 pt-2.5 border-t border-border text-[10px] py-1 text-foreground font-medium">
              {user.role === "admin" ? "Revoke Admin" : "Make Admin"}
            </button>
          </div>
        ))}
        {paginated.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs border border-border">No customers found.</div>
        )}
      </div>

      {/* Table */}
      <div className="hidden md:block border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-card">
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-3 w-8"><input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleAll} className="accent-[#c4956a]" /></th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Customer</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Email</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Role</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider hidden md:table-cell">Joined</th>
              <th className="p-3 font-medium text-[10px] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((user) => (
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
                <td className="p-3">
                  <button onClick={() => toggleRole(user._id, user.role)} className="text-[10px] px-2.5 py-1 border border-border hover:border-[#c4956a]/30 transition-colors text-foreground font-medium">
                    {user.role === "admin" ? "Revoke" : "Make Admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">No customers found.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
              <ChevronLeft className="h-3 w-3" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
              return (
                <button key={p} onClick={() => setPage(p)} className={`h-7 w-7 text-[10px] font-medium ${page === p ? "bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14]" : "border border-border text-muted-foreground hover:text-foreground"}`}>
                  {p}
                </button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30">
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: "bulk" })}
        onConfirm={confirmDelete}
        title={deleteDialog.type === "bulk" ? `Delete ${selected.size} User(s)?` : "Delete User?"}
        description="This will permanently remove the user and their data."
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
