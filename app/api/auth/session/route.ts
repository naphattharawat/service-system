import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

// Replaces the legacy client-trusted sessionStorage.mavUser read.
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(user);
}
