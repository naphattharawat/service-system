import { NextRequest, NextResponse } from "next/server";
import { changeUserProfile } from "@/lib/users";
import { getSession, requireUser } from "@/lib/session";
import { jsonError } from "@/lib/route-utils";

// PATCH = legacy changeUserProfile, scoped to the logged-in user's own account.
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireUser();
    const body = (await request.json()) as { oldPw: string; newPw?: string; newUser?: string };

    const result = await changeUserProfile({ user: currentUser.user, ...body });

    if (result.success && result.newUsername) {
      const session = await getSession();
      session.user = result.newUsername;
      await session.save();
    }

    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
