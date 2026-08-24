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
          type: "image",
          url: "https://cdns.yellow-idea.com/moph/20250602/moph-flex-header-1.png",
          size: "full",
          aspectMode: "cover",
          aspectRatio: "3120:885",
        },
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
        {
          type: "box",
          layout: "vertical",
          margin: "sm",
          contents: [
            {
              type: "text",
              text: "โรงพยาบาล",
              weight: "bold",
              size: "18px",
              align: "center",
              scaling: true,
              adjustMode: "shrink-to-fit",
            },
            {
              type: "text",
              text: "เจ้าพระยาอภัยภูเบศร",
              weight: "bold",
              size: "18px",
              align: "center",
              margin: "none",
              scaling: true,
              adjustMode: "shrink-to-fit",
            },
          ],
        },
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
  const message = buildFlexBubbleMessage({
    altText: `งาน #${jobId} ได้รับมอบหมายให้ ${ownerNames}`,
    headline: `งานได้รับมอบหมาย #${jobId}`,
    bodyText: `งาน #${jobId} ถูกมอบหมายให้ ${ownerNames} แล้ว กรุณาตรวจสอบและดำเนินการ`,
    rows: [
      ["ผู้รับผิดชอบ", ownerNames],
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
