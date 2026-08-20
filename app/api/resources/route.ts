import { NextResponse } from "next/server";
import { getResources } from "@/lib/resources";
import { requireUser } from "@/lib/session";
import { jsonError } from "@/lib/route-utils";

// GET = legacy getResources. The legacy client always sent its own
// {owner: CURRENT_USER.name, role: CURRENT_USER.role}; deriving both from the
// server session instead means a staff account can no longer request another
// staff member's resource log by tampering with the request.
export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json(await getResources(user.name, user.role));
  } catch (err) {
    return jsonError(err);
  }
}
