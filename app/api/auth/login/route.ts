import { NextRequest, NextResponse } from "next/server";
import { checkLogin } from "@/lib/users";
import { getSession } from "@/lib/session";
import { jsonError } from "@/lib/route-utils";

// POST = legacy checkLogin, now also issuing a real server-side session cookie
// instead of leaving the browser to self-report {success,role,name} via sessionStorage.
export async function POST(request: NextRequest) {
  try {
    const { u, p } = (await request.json()) as { u: string; p: string };
    const result = await checkLogin(u, p);

    if (result.success && result.user && result.role && result.name) {
      const session = await getSession();
      session.user = result.user;
      session.role = result.role;
      session.name = result.name;
      await session.save();
    }

    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
