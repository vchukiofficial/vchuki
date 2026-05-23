import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import WhatsAppConfig from "@/models/WhatsAppConfig"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  let config = await WhatsAppConfig.findOne().lean()

  // Create default config if none exists
  if (!config) {
    const created = await WhatsAppConfig.create({
      businessId: "",
      phoneNumberId: "",
      accessToken: "",
      webhookVerifyToken: "vchuki_webhook_verify_2025",
      webhookUrl: "",
      isActive: false,
      businessName: "VCHUKI",
      templates: [],
      flows: [
        { name: "Welcome Message", trigger: "welcome", templateName: "welcome_new_customer", isActive: false, delay: 0 },
        { name: "Order Confirmation", trigger: "order_confirmed", templateName: "order_confirmed", isActive: false, delay: 0 },
        { name: "Order Shipped", trigger: "order_shipped", templateName: "order_shipped", isActive: false, delay: 0 },
        { name: "Order Delivered", trigger: "order_delivered", templateName: "order_delivered", isActive: false, delay: 0 },
        { name: "Abandoned Cart Recovery", trigger: "abandoned_cart", templateName: "abandoned_cart_reminder", isActive: false, delay: 60 },
        { name: "Review Request", trigger: "review_request", templateName: "review_request", isActive: false, delay: 1440 },
      ],
      stats: { messagesSent: 0, messagesDelivered: 0, messagesRead: 0, templatesSent: 0 },
    })
    config = created.toObject()
  }

  return NextResponse.json({ config })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const body = await request.json()

  const config = await WhatsAppConfig.findOne()
  if (!config) return NextResponse.json({ error: "Config not found" }, { status: 404 })

  // Update fields
  if (body.businessId !== undefined) config.businessId = body.businessId
  if (body.phoneNumberId !== undefined) config.phoneNumberId = body.phoneNumberId
  if (body.accessToken !== undefined) config.accessToken = body.accessToken
  if (body.webhookVerifyToken !== undefined) config.webhookVerifyToken = body.webhookVerifyToken
  if (body.webhookUrl !== undefined) config.webhookUrl = body.webhookUrl
  if (body.isActive !== undefined) config.isActive = body.isActive
  if (body.businessName !== undefined) config.businessName = body.businessName

  await config.save()
  return NextResponse.json({ config })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const body = await request.json()
  const { action } = body

  const config = await WhatsAppConfig.findOne()
  if (!config) return NextResponse.json({ error: "Config not found" }, { status: 404 })

  switch (action) {
    case "add_template": {
      config.templates.push(body.template)
      await config.save()
      return NextResponse.json({ template: config.templates[config.templates.length - 1] })
    }
    case "update_template": {
      const idx = config.templates.findIndex((t: any) => t._id?.toString() === body.templateId)
      if (idx >= 0) {
        Object.assign(config.templates[idx], body.updates)
        await config.save()
      }
      return NextResponse.json({ success: true })
    }
    case "delete_template": {
      config.templates = config.templates.filter((t: any) => t._id?.toString() !== body.templateId)
      await config.save()
      return NextResponse.json({ success: true })
    }
    case "toggle_flow": {
      const flow = config.flows.find((f: any) => f.trigger === body.trigger)
      if (flow) {
        flow.isActive = !flow.isActive
        await config.save()
      }
      return NextResponse.json({ success: true })
    }
    case "update_flow": {
      const flowIdx = config.flows.findIndex((f: any) => f.trigger === body.trigger)
      if (flowIdx >= 0) {
        Object.assign(config.flows[flowIdx], body.updates)
        await config.save()
      }
      return NextResponse.json({ success: true })
    }
    case "test_message": {
      // Simulate sending a test message
      config.stats.messagesSent += 1
      await config.save()
      return NextResponse.json({ success: true, message: "Test message queued" })
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  }
}
