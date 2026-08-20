import { NextRequest, NextResponse } from "next/server";
import { searchJob } from "@/lib/jobs";
import { jsonError } from "@/lib/route-utils";

// GET = legacy searchData. Public — anyone can look up their own job by id/name.
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? "";
    const result = await searchJob(q);
    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
