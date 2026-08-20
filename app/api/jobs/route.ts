import { NextRequest, NextResponse } from "next/server";
import { getAllJobs, submitJob } from "@/lib/jobs";
import { requireUser } from "@/lib/session";
import { jsonError } from "@/lib/route-utils";
import type { SubmitServicePayload } from "@/types";

// GET = legacy getAllData (admin/staff dashboard). The legacy backend had no
// auth check here at all; requiring a session is an intentional tightening.
export async function GET() {
  try {
    await requireUser();
    return NextResponse.json(await getAllJobs());
  } catch (err) {
    return jsonError(err);
  }
}

// POST = legacy submitService. Public — anyone can submit a service request.
export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SubmitServicePayload;
    const result = await submitJob(payload);
    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err);
  }
}
