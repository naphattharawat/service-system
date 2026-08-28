import { config } from "./config";
import type { SubmitServicePayload } from "@/types";

interface LineMessage {
  type: string;
  [key: string]: unknown;
}

interface LineCredentials {
  clientKey: string;
  secretKey: string;
}

/** Sends one or more LINE messages via the MOPH notify gateway, using the given destination's credentials. */
async function sendLineNotify(messages: LineMessage[], creds: LineCredentials): Promise<void> {
  const res = await fetch(config.lineNotify.url(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "client-key": creds.clientKey,
      "secret-key": creds.secretKey,
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LINE notify failed (${res.status}): ${body}`);
  }
}

type FlexBox = Record<string, unknown>;

function splitOwnerNames(ownerNames: string): string[] {
  return ownerNames
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

function formatOwnerTitle(ownerNames: string): string {
  const names = splitOwnerNames(ownerNames);

  if (names.length === 0) return "";
  if (names.length === 1) return names[0];

  return names
    .map((name) => name.split(/\s+/).filter(Boolean)[0] ?? name)
    .join(", ");
}

function formatOwnerFull(ownerNames: string): string {
  const names = splitOwnerNames(ownerNames);
  return names.join(", ");
}

// One label/value line inside the details section, e.g. "หน่วยงาน: เวชนิทัศน์ฯ".
function infoRow(label: string, value: string): FlexBox {
  return {
    type: "box",
    layout: "horizontal",
    margin: "md",
    contents: [
      { type: "text", text: label, size: "sm", color: "#8A94A6", flex: 3 },
      {
        type: "text",
        text: value || "-",
        size: "sm",
        weight: "bold",
        color: "#18243C",
        wrap: true,
        flex: 5,
      },
    ],
  };
}

// Ported from the MOPH notify sample card the user supplied — same header
// banner / title-box / hospital-name layout, but with this hospital's own
// name and this job's own details instead of the Bueng Kan Hospital sample
// content. The circular avatar image from that sample is skipped: it was
// Bueng Kan Hospital's own logo asset, and this app has no public URL of
// its own yet (still running locally) for LINE's servers to fetch a
// replacement from — add one once deployed.
function buildFlexBubbleMessage(opts: {
  altText: string;
  headline: string;
  bodyText: string;
  rows: [string, string][];
  titleLine?: string;
  hospitalName?: string;
}): LineMessage {
  const bubble = {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      paddingAll: "0px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          background: { type: "linearGradient", angle: "100deg", startColor: "#2148B0", endColor: "#3C6FE0" },
          paddingAll: "16px",
          alignItems: "center",
          spacing: "md",
          contents: [
            {
              type: "box",
              layout: "vertical",
              width: "36px",
              height: "36px",
              cornerRadius: "18px",
              backgroundColor: "#FFFFFF",
              justifyContent: "center",
              alignItems: "center",
              contents: [
                {
                  type: "image",
                  url: "https://m.cpa.go.th/service-system/logo.png",
                  size: "26px",
                  aspectMode: "cover",
                },
              ],
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                { type: "text", text: "โรงพยาบาลเจ้าพระยาอภัยภูเบศร", size: "13px", color: "#FFFFFF", weight: "bold" },
                { type: "text", text: "งานเวชนิทัศน์และโสตทัศนศึกษา", size: "10px", color: "#DCE7FF" },
              ],
            },
          ],
        },
        { type: "box", layout: "vertical", height: "6px", backgroundColor: "#FFC24B", contents: [] },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          backgroundColor: "#DCE7FF",
          cornerRadius: "15px",
          margin: "xs",
          paddingTop: "lg",
          paddingBottom: "lg",
          paddingStart: "8px",
          paddingEnd: "8px",
          contents: [
            {
              type: "text",
              text: opts.headline,
              weight: "bold",
              size: "lg",
              align: "center",
              color: "#2D2D2D",
              adjustMode: "shrink-to-fit",
            },
          ],
        },
        {
          type: "box",
          layout: "vertical",
          margin: "20px",
          contents: [
            {
              type: "text",
              text: opts.bodyText,
              align: "center",
              gravity: "center",
              size: "15px",
              wrap: true,
              adjustMode: "shrink-to-fit",
            },
          ],
        },
        ...(opts.hospitalName || opts.titleLine
          ? [
              {
                type: "box",
                layout: "vertical",
                margin: "sm",
                contents: [
                  ...(opts.hospitalName
                    ? [
                        {
                          type: "text",
                          text: opts.hospitalName,
                          weight: "bold",
                          size: "18px",
                          align: "center",
                          scaling: true,
                          adjustMode: "shrink-to-fit",
                        },
                      ]
                    : []),
                  ...(opts.titleLine
                    ? [
                        {
                          type: "text",
                          text: opts.titleLine,
                          weight: "bold",
                          size: "18px",
                          align: "center",
                          margin: opts.hospitalName ? "none" : "0px",
                          scaling: true,
                          adjustMode: "shrink-to-fit",
                        },
                      ]
                    : []),
                ],
              },
            ]
          : []),
        { type: "separator", margin: "18px" },
        {
          type: "box",
          layout: "vertical",
          margin: "lg",
          spacing: "sm",
          contents: opts.rows.map(([label, value]) => infoRow(label, value)),
        },
      ],
    },
  };

  return { type: "flex", altText: opts.altText, contents: bubble };
}

/** Notifies the "new request" LINE destination about a newly submitted service request. Best-effort — callers should not let a failure here fail the submission. */
export async function notifyNewJob(jobId: number, payload: SubmitServicePayload): Promise<void> {
  const fullName = `${payload.prefix} ${payload.name} ${payload.lastname}`.trim();
  const message = buildFlexBubbleMessage({
    altText: `มีคำขอรับบริการใหม่ #${jobId}: ${fullName}`,
    headline: `มีคำขอรับบริการใหม่ #${jobId}`,
    bodyText: "งานเวชนิทัศน์และโสตทัศนศึกษา ได้รับคำขอรับบริการใหม่ กรุณาตรวจสอบและดำเนินการ",
    hospitalName: payload.type,
    rows: [
      ["ผู้ขอ", fullName],
      ["หน่วยงาน", payload.department],
      ["ประเภทงาน", payload.type],
      ["รายละเอียด", payload.detail],
      ["ต้องการภายใน", payload.needDate],
      ["เบอร์ติดต่อ", payload.phone],
    ],
  });
  await sendLineNotify([message], {
    clientKey: config.lineNotify.newJob.clientKey(),
    secretKey: config.lineNotify.newJob.secretKey(),
  });
}

/** Notifies the separate "job assigned" LINE destination when a job's owner/assignee changes. Best-effort. */
export async function notifyJobAssigned(
  jobId: string,
  ownerNames: string,
  job: { fullName: string; department: string; jobType: string; needDate: string }
): Promise<void> {
  const titleOwnerNames = formatOwnerTitle(ownerNames);
  const fullOwnerNames = formatOwnerFull(ownerNames);
  const message = buildFlexBubbleMessage({
    altText: `งาน #${jobId} ได้รับมอบหมายให้ ${fullOwnerNames}`,
    headline: `#${jobId}`,
    bodyText: `งาน #${jobId} ถูกมอบหมายให้`,
    titleLine: titleOwnerNames,
    rows: [
      ["ผู้รับผิดชอบ", fullOwnerNames],
      ["ผู้ขอ", job.fullName],
      ["หน่วยงาน", job.department],
      ["ประเภทงาน", job.jobType],
      ["ต้องการภายใน", job.needDate],
    ],
  });
  await sendLineNotify([message], {
    clientKey: config.lineNotify.jobAssigned.clientKey(),
    secretKey: config.lineNotify.jobAssigned.secretKey(),
  });
}
