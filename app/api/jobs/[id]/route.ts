import { NextRequest, NextResponse } from "next/server";
import { updateJobRecord } from "@/lib/jobs";
import { requireUser } from "@/lib/session";
import { jsonError } from "@/lib/route-utils";
import type { UpdateJobPayload } from "@/types";

// PATCH = legacy updateJob.
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/jobs/[id]">) {
  try {
    await requireUser();
    const { id } = await ctx.params;
    const body = (await request.json()) as Omit<UpdateJobPayload, "id">;
    await updateJobRecord({ ...body, id });
    return NextResponse.json({ success: true });
  } catch (err) {
    return jsonError(err);
  }
}
