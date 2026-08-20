import { NextResponse } from "next/server";
import { HttpError } from "./errors";

export function jsonError(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด";
  return NextResponse.json({ error: message }, { status: 500 });
}
