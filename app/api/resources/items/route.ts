import { NextRequest, NextResponse } from "next/server";
import { addResourceItem, deleteResourceItem, getResourceList } from "@/lib/resources";
import { requireUser } from "@/lib/session";
import { jsonError } from "@/lib/route-utils";

// GET = legacy getResourceList.
export async function GET() {
  try {
    await requireUser();
    return NextResponse.json(await getResourceList());
  } catch (err) {
    return jsonError(err);
  }
}

// POST = legacy addResourceItem.
export async function POST(request: NextRequest) {
  try {
    await requireUser();
    const { name } = (await request.json()) as { name: string };
    await addResourceItem(name);
    return NextResponse.json({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}

// DELETE = legacy deleteResourceItem.
export async function DELETE(request: NextRequest) {
  try {
    await requireUser();
    const name = request.nextUrl.searchParams.get("name") ?? "";
    await deleteResourceItem(name);
    return NextResponse.json({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
