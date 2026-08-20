import { NextRequest, NextResponse } from "next/server";
import { addUser, getUsers } from "@/lib/users";
import { requireRole, requireUser } from "@/lib/session";
import { jsonError } from "@/lib/route-utils";
import type { Role } from "@/types";

// GET = legacy getUsers.
export async function GET() {
  try {
    await requireUser();
    return NextResponse.json(await getUsers());
  } catch (err) {
    return jsonError(err);
  }
}

// POST = legacy addUser. Admin only.
export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");
    const { user, pass, role, name } = (await request.json()) as {
      user: string;
      pass: string;
      role: Role;
      name: string;
    };
    await addUser(user, pass, role, name);
    return NextResponse.json({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
