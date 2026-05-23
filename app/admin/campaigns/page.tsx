"use client"

import { useState } from "react"
import { Megaphone, Calendar, Zap, Gift, Clock, Plus, Trash2 } from "lucide-react"

interface Campaign {
  id: string
  name: string
  type: "launch" | "flash_sale" | "festival" | "referral" | "seasonal"
  status: "active" | "scheduled" | "ended"
  discount: string
  startDate: string
  endDate: string
  reach: number
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "1", name: "Launch Day — 7 July", type: "launch", status: "scheduled", discount: "Flat ₹100 off", startDate: "2025-07-07", endDate: "2025-07-10", reach: 0 },
  { id: "2", name: "First Order 10% Off", type: "referral", status: "active", discount: "10% up to ₹200", startDate: "2025-01-01", endDate: "2025-12-31", reach: 1250 },
  { id: "3", name: "Summer Linen Sale", type: "seasonal", status: "active", discount: "15% on Linen", startDate: "2025-04-01", endDate: "2025-07-31", reach: 3400 },
]

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS)
  const [showCreate, setShowCreate] = useState(false)

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: fd.get("name") as string,
      type: fd.get("type") as Campaign["type"],
      status: "scheduled",
      discount: fd.get("discount") as string,
      startDate: fd.get("startDate") as string,
      endDate: fd.get("endDate") as string,
      reach: 0,
    }
    setCampaigns([newCampaign, ...campaigns])
    setShowCreate(false)
  }

  function deleteCampaign(id: string) {
    setCampaigns(campaigns.filter(c => c.id !== id))
  }

  const active = campaigns.filter(c => c.status === "active")
  const scheduled = campaigns.filter(c => c.status === "scheduled")

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Campaigns</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Marketing campaigns, flash sales & promotions</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 transition-opacity">
          <Plus className="h-3 w-3" /> New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-emerald-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Active</span></div>
          <p className="text-xl font-light text-foreground mt-1">{active.length}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-blue-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Scheduled</span></div>
          <p className="text-xl font-light text-foreground mt-1">{scheduled.length}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><Gift className="h-3.5 w-3.5 text-[#c4956a]" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Reach</span></div>
          <p className="text-xl font-light text-foreground mt-1">{campaigns.reduce((s, c) => s + c.reach, 0).toLocaleString()}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><Megaphone className="h-3.5 w-3.5 text-purple-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span></div>
          <p className="text-xl font-light text-foreground mt-1">{campaigns.length}</p>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 border border-[#c4956a]/20 bg-[#c4956a]/5 space-y-3">
          <p className="text-sm font-medium text-foreground">Create Campaign</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Name</label>
              <input name="name" required className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground" placeholder="Summer Flash Sale" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Type</label>
              <select name="type" className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground">
                <option value="launch">Launch Offer</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="festival">Festival Sale</option>
                <option value="referral">Referral</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Discount</label>
              <input name="discount" required className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground" placeholder="20% off" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Start Date</label>
              <input name="startDate" type="date" required className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">End Date</label>
              <input name="endDate" type="date" required className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider">Create</button>
            </div>
          </div>
        </form>
      )}

      {/* Campaigns List */}
      <div className="space-y-2">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="p-4 border border-border bg-card hover:border-[#c4956a]/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  campaign.status === "active" ? "bg-emerald-500/10" : "bg-blue-500/10"
                }`}>
                  {campaign.status === "active" ? <Zap className="h-3.5 w-3.5 text-emerald-500" /> : <Clock className="h-3.5 w-3.5 text-blue-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{campaign.name}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 font-medium uppercase ${
                      campaign.status === "active" ? "bg-emerald-500/10 text-emerald-600" :
                      campaign.status === "scheduled" ? "bg-blue-500/10 text-blue-600" :
                      "bg-muted text-muted-foreground"
                    }`}>{campaign.status}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground capitalize">{campaign.type.replace("_", " ")}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {campaign.discount} · {new Date(campaign.startDate).toLocaleDateString("en-IN")} → {new Date(campaign.endDate).toLocaleDateString("en-IN")}
                    {campaign.reach > 0 && <span className="ml-2">· {campaign.reach.toLocaleString()} reached</span>}
                  </p>
                </div>
              </div>
              <button onClick={() => deleteCampaign(campaign.id)} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
