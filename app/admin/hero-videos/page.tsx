"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Calendar } from "lucide-react"

interface HeroVideo {
  _id: string
  title: string
  url: string
  isActive: boolean
  order: number
  scheduledStart?: string
  scheduledEnd?: string
}

// Converts an ISO date string to the value <input type="datetime-local"> expects (local time, no seconds/zone)
function toLocalInputValue(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export default function HeroVideosAdmin() {
  const [videos, setVideos] = useState<HeroVideo[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [scheduledStart, setScheduledStart] = useState("")
  const [scheduledEnd, setScheduledEnd] = useState("")
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => { fetchVideos() }, [])

  async function fetchVideos() {
    const res = await fetch("/api/admin/hero-videos")
    const data = await res.json()
    setVideos(data.videos || [])
  }

  async function handleUploadAndAdd() {
    if (!title) return alert("Title is required")
    setUploading(true)

    let videoUrl = url

    // If file selected, upload to blob
    if (file) {
      const formData = new FormData()
      formData.append("file", file)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
      const uploadData = await uploadRes.json()
      if (uploadRes.ok) {
        videoUrl = uploadData.url
      } else {
        alert("Upload failed")
        setUploading(false)
        return
      }
    }

    if (!videoUrl) { alert("Provide a video URL or upload a file"); setUploading(false); return }

    await fetch("/api/admin/hero-videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        url: videoUrl,
        order: videos.length,
        scheduledStart: scheduledStart ? new Date(scheduledStart).toISOString() : undefined,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd).toISOString() : undefined,
      }),
    })
    setTitle("")
    setUrl("")
    setFile(null)
    setScheduledStart("")
    setScheduledEnd("")
    setUploading(false)
    fetchVideos()
  }

  async function updateSchedule(video: HeroVideo, field: "scheduledStart" | "scheduledEnd", value: string) {
    await fetch("/api/admin/hero-videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: video._id, [field]: value ? new Date(value).toISOString() : null }),
    })
    fetchVideos()
  }

  async function toggleActive(video: HeroVideo) {
    await fetch("/api/admin/hero-videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: video._id, isActive: !video.isActive }),
    })
    fetchVideos()
  }

  async function updateOrder(video: HeroVideo, direction: "up" | "down") {
    const sorted = [...videos].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((v) => v._id === video._id)
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    await fetch("/api/admin/hero-videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sorted[idx]._id, order: sorted[swapIdx].order }),
    })
    await fetch("/api/admin/hero-videos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sorted[swapIdx]._id, order: sorted[idx].order }),
    })
    fetchVideos()
  }

  async function deleteVideo(id: string) {
    if (!confirm("Delete this video?")) return
    await fetch(`/api/admin/hero-videos?id=${id}`, { method: "DELETE" })
    fetchVideos()
  }

  function scheduleLabel(video: HeroVideo) {
    if (!video.scheduledStart && !video.scheduledEnd) return null
    const now = new Date()
    const start = video.scheduledStart ? new Date(video.scheduledStart) : null
    const end = video.scheduledEnd ? new Date(video.scheduledEnd) : null
    if (start && now < start) return { text: `Scheduled for ${start.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`, color: "bg-amber-100 text-amber-700" }
    if (end && now > end) return { text: `Expired ${end.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`, color: "bg-red-100 text-red-700" }
    return { text: "Within scheduled window", color: "bg-blue-100 text-blue-700" }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Hero Videos</h1>

      {/* Add new */}
      <div className="border border-border p-4 mb-8 space-y-3 bg-card">
        <h2 className="text-sm font-medium">Add New Video</h2>
        <input
          type="text"
          placeholder="Video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-border bg-background text-sm"
        />
        <input
          type="text"
          placeholder="Video URL (or upload below)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border border-border bg-background text-sm"
        />
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1"><Calendar className="h-3 w-3" /> Go Live At (optional)</label>
            <input
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1"><Calendar className="h-3 w-3" /> Expires At (optional)</label>
            <input
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-border bg-background text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleUploadAndAdd}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-[#2a1f14] text-[#f5e6d3] text-xs font-medium uppercase tracking-wider disabled:opacity-50"
        >
          <Plus className="h-3 w-3" /> {uploading ? "Uploading..." : "Add Video"}
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {videos.sort((a, b) => a.order - b.order).map((video) => {
          const schedule = scheduleLabel(video)
          return (
          <div key={video._id} className={`p-4 border ${video.isActive ? "border-border" : "border-border opacity-50"} bg-card`}>
            <div className="flex items-center gap-4">
              <div className="w-24 md:w-32 h-16 md:h-20 bg-black flex-shrink-0 overflow-hidden">
                <video src={video.url} className="w-full h-full object-cover" muted />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{video.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{video.url}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 inline-block ${video.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {video.isActive ? "Active" : "Inactive"}
                  </span>
                  {schedule && (
                    <span className={`text-[10px] px-2 py-0.5 inline-block ${schedule.color}`}>{schedule.text}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => updateOrder(video, "up")} className="p-1.5 hover:bg-muted rounded"><ArrowUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => updateOrder(video, "down")} className="p-1.5 hover:bg-muted rounded"><ArrowDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => toggleActive(video)} className="p-1.5 hover:bg-muted rounded">
                  {video.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => deleteVideo(video._id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            {/* Schedule editor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Go Live At</label>
                <input
                  type="datetime-local"
                  defaultValue={toLocalInputValue(video.scheduledStart)}
                  onBlur={(e) => updateSchedule(video, "scheduledStart", e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 border border-border bg-background text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Expires At</label>
                <input
                  type="datetime-local"
                  defaultValue={toLocalInputValue(video.scheduledEnd)}
                  onBlur={(e) => updateSchedule(video, "scheduledEnd", e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 border border-border bg-background text-xs"
                />
              </div>
            </div>
          </div>
        )})}
        {videos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No videos yet. Add one above. Fallback video will play until then.</p>
        )}
      </div>
    </div>
  )
}
