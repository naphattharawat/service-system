import { NextRequest, NextResponse } from "next/server";
import { deleteUser, toggleUserStatus } from "@/lib/users";
import { requireRole } from "@/lib/session";
import { jsonError } from "@/lib/route-utils";

// PATCH = legacy toggleUserStatus. Admin only.
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/users/[user]">) {
  try {
    await requireRole("admin");
    const { user } = await ctx.params;
    const { currentStatus } = (await request.json()) as { currentStatus: boolean };
    await toggleUserStatus(decodeURIComponent(user), currentStatus);
    return NextResponse.json({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}

// DELETE = legacy deleteUser. Admin only.
export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/users/[user]">) {
  try {
    await requireRole("admin");
    const { user } = await ctx.params;
    const deleted = await deleteUser(decodeURIComponent(user));
    return NextResponse.json({ success: deleted });
  } catch (err) {
    return jsonError(err);
  }
}
