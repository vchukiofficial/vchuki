"use client"

import { useEffect, useState } from "react"
import { Shield, ShieldOff } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
  addresses: any[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data.users || []); setLoading(false) })
  }, [])

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin"
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      setUsers(users.map((u) => u._id === userId ? { ...u, role: newRole } : u))
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading users...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>

      <div className="rounded-lg border border-border/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Addresses</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-border/50">
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{user.addresses?.length || 0}</td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleRole(user._id, user.role)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
                      user.role === "admin"
                        ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                        : "border-primary/30 text-primary hover:bg-primary/10"
                    }`}
                    title={user.role === "admin" ? "Remove admin" : "Make admin"}
                  >
                    {user.role === "admin" ? <><ShieldOff className="h-3 w-3" /> Revoke</> : <><Shield className="h-3 w-3" /> Make Admin</>}
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
