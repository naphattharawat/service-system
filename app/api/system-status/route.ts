import { NextRequest, NextResponse } from "next/server";
import { getSystemStatus, setSystemStatus } from "@/lib/settings";
import { requireRole } from "@/lib/session";
import { jsonError } from "@/lib/route-utils";

// GET = legacy getSystemStatus. Public — the home page needs this before login.
export async function GET() {
  try {
    return NextResponse.json(await getSystemStatus());
  } catch (err) {
    return jsonError(err);
  }
}

// PATCH = legacy setSystemStatus. Admin only.
export async function PATCH(request: NextRequest) {
  try {
    await requireRole("admin");
    const { open } = (await request.json()) as { open: boolean };
    return NextResponse.json(await setSystemStatus(open));
  } catch (err) {
    return jsonError(err);
  }
}
