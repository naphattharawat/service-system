import { config } from "./config";
import { appendRow, getSheetValues, updateCell, updateRow } from "./sheets";
import { createFolder, fileUrl, folderUrl, shareAnyoneWithLinkView, uploadFile } from "./drive";
import { notifyJobAssigned, notifyNewJob } from "./line-notify";
import { submitLock } from "./submit-lock";
import { dateCellToTimestamp, formatDateCell, nowAsSheetsDateTime } from "./date-utils";
import { NotFoundError } from "./errors";
import type {
  Job,
  JobSearchResult,
  ResourceLineItem,
  SubmitServicePayload,
  UpdateJobPayload,
} from "@/types";

// 0-based column indices into a Sheet1 job row (see old/gs.txt CONFIG/functions).
const COL = {
  ID: 0,
  STATUS: 1,
  TIMESTAMP: 3,
  PREFIX: 4,
  NAME: 5,
  LASTNAME: 6,
  GROUP: 7,
  DEPARTMENT: 8,
  JOB_TYPE: 15,
  ORDER_DATE: 16,
  DETAIL: 17,
  FILE_URL: 18,
  NEED_DATE: 19,
  PHONE: 20,
  OWNER: 21,
  NOTE: 22,
} as const;

// 1-based column numbers, for single-cell updates.
const COL_1 = {
  STATUS: 2,
  OWNER: 22,
  NOTE: 23,
} as const;

function normalizeStatus(raw: unknown): string {
  const st = String(raw ?? "").trim();
  if (st === "" || st === "#N/A" || st === "#REF!") return "รอดำเนินการ";
  return st;
}

function fullName(row: unknown[]): string {
  return `${row[COL.PREFIX] || ""} ${row[COL.NAME] || ""} ${row[COL.LASTNAME] || ""}`.trim();
}

function buildSearchResult(row: unknown[]): JobSearchResult {
  return {
    id: String(row[COL.ID]),
    name: fullName(row),
    group: String(row[COL.GROUP] ?? ""),
    department: String(row[COL.DEPARTMENT] ?? ""),
    type: String(row[COL.JOB_TYPE] ?? ""),
    orderDate: formatDateCell(row[COL.ORDER_DATE]),
    detail: String(row[COL.DETAIL] ?? ""),
    fileUrl: String(row[COL.FILE_URL] ?? ""),
    needDate: formatDateCell(row[COL.NEED_DATE]),
    phone: String(row[COL.PHONE] ?? ""),
    status: normalizeStatus(row[COL.STATUS]),
    owner: String(row[COL.OWNER] ?? "-"),
    note: String(row[COL.NOTE] ?? ""),
  };
}

export async function getAllJobs(): Promise<Job[]> {
  const rows = await getSheetValues(config.sheet1.id(), config.sheet1.jobsTab());
  const result: Job[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[COL.ID] || Number.isNaN(Number(row[COL.ID]))) continue;

    result.push({
      idNum: parseInt(String(row[COL.ID]), 10),
      id: String(row[COL.ID]).trim(),
      status: normalizeStatus(row[COL.STATUS]),
      timestamp: dateCellToTimestamp(row[COL.TIMESTAMP]),
      prefix: String(row[COL.PREFIX] ?? "").trim(),
      name: String(row[COL.NAME] ?? "").trim(),
      lastname: String(row[COL.LASTNAME] ?? "").trim(),
      fullName: fullName(row),
      group: String(row[COL.GROUP] ?? "").trim(),
      department: String(row[COL.DEPARTMENT] ?? "").trim(),
      jobType: String(row[COL.JOB_TYPE] ?? "").trim(),
      orderDate: formatDateCell(row[COL.ORDER_DATE]),
      detail: String(row[COL.DETAIL] ?? "").trim(),
      fileUrl: String(row[COL.FILE_URL] ?? "").trim(),
      needDate: formatDateCell(row[COL.NEED_DATE]),
      phone: String(row[COL.PHONE] ?? "").trim(),
      owner: String(row[COL.OWNER] ?? "-").trim(),
      note: String(row[COL.NOTE] ?? "").trim(),
    });
  }

  result.sort((a, b) => b.idNum - a.idNum);
  return result;
}

export async function searchJob(input: string): Promise<JobSearchResult | null> {
  if (!input) return null;
  const rows = await getSheetValues(config.sheet1.id(), config.sheet1.jobsTab());
  const needle = input.toString().trim().toLowerCase();

  if (needle !== "" && !Number.isNaN(Number(needle))) {
    const id = parseInt(needle, 10);
    for (let i = 1; i < rows.length; i++) {
      if (parseInt(String(rows[i][COL.ID]), 10) === id) return buildSearchResult(rows[i]);
    }
  } else {
    for (let i = rows.length - 1; i > 0; i--) {
      const name = fullName(rows[i]).toLowerCase();
      if (name.includes(needle)) return buildSearchResult(rows[i]);
    }
  }
  return null;
}

export async function submitJob(
  payload: SubmitServicePayload
): Promise<{ id: number; fileUrl: string }> {
  return submitLock.runExclusive(async () => {
    const sheetId = config.sheet1.id();
    const tab = config.sheet1.jobsTab();
    const rows = await getSheetValues(sheetId, tab);

    let lastId = 0;
    for (let r = rows.length - 1; r >= 1; r--) {
      const v = Number(rows[r][COL.ID]);
      if (rows[r][COL.ID] && !Number.isNaN(v)) {
        lastId = v;
        break;
      }
    }
    const newId = lastId + 1;

    const row: unknown[] = new Array(24).fill("");
    let fileUrlOut = "";

    if (payload.files && payload.files.length > 0) {
      const folderId = await createFolder(config.drive.folderId(), `#${newId}`);
      const urls: string[] = [];
      for (const f of payload.files) {
        const fileId = await uploadFile(folderId, f.name, f.type, f.data);
        await shareAnyoneWithLinkView(fileId);
        urls.push(fileUrl(fileId));
      }
      await shareAnyoneWithLinkView(folderId);
      row[COL.FILE_URL] = folderUrl(folderId);
      fileUrlOut = urls.join(", ");
    }

    row[COL.ID] = newId;
    row[COL.STATUS] = "รอดำเนินการ";
    row[COL.TIMESTAMP] = nowAsSheetsDateTime();
    row[COL.PREFIX] = payload.prefix || "";
    row[COL.NAME] = payload.name || "";
    row[COL.LASTNAME] = payload.lastname || "";
    row[COL.GROUP] = payload.group || "";
    row[COL.DEPARTMENT] = payload.department || "";
    row[COL.JOB_TYPE] = payload.type || "";
    row[COL.ORDER_DATE] = payload.orderDate || "";
    row[COL.DETAIL] = payload.detail || "";
    if (!row[COL.FILE_URL]) row[COL.FILE_URL] = fileUrlOut;
    row[COL.NEED_DATE] = payload.needDate || "";
    row[COL.PHONE] = `'${payload.phone || ""}`;
    row[COL.OWNER] = "-";
    row[COL.NOTE] = "";

    await appendRow(sheetId, tab, row);

    // Best-effort: a LINE notify failure must never fail the submission
    // that the requester is actively waiting on.
    try {
      await notifyNewJob(newId, payload);
    } catch (err) {
      console.error("LINE notify failed for job", newId, err);
    }

    return { id: newId, fileUrl: fileUrlOut };
  });
}

export async function updateJobRecord(payload: UpdateJobPayload): Promise<true> {
  const sheetId = config.sheet1.id();
  const tab = config.sheet1.jobsTab();
  const rows = await getSheetValues(sheetId, tab);

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][COL.ID]).trim() === String(payload.id).trim()) {
      rowIndex = i + 1; // 1-based sheet row
      break;
    }
  }
  if (rowIndex === -1) throw new NotFoundError("ไม่พบข้อมูลงานในระบบ");
  const existingRow = rows[rowIndex - 1];
  const previousOwner = String(existingRow[COL.OWNER] ?? "").trim();

  if (payload.status) await updateCell(sheetId, tab, rowIndex, COL_1.STATUS, payload.status);
  if (payload.owner) await updateCell(sheetId, tab, rowIndex, COL_1.OWNER, payload.owner);
  if (payload.note !== undefined) await updateCell(sheetId, tab, rowIndex, COL_1.NOTE, payload.note);

  // Notify the separate "job assigned" LINE destination only on an actual
  // ownership change (not every save — EditJobModal always resends the
  // current owner value even when it hasn't changed). Best-effort, same as
  // notifyNewJob: never let a notify failure fail the actual update.
  const newOwner = payload.owner ? payload.owner.trim() : previousOwner;
  if (payload.owner && newOwner !== previousOwner && newOwner !== "" && newOwner !== "-") {
    try {
      await notifyJobAssigned(String(payload.id), newOwner, {
        fullName: fullName(existingRow),
        department: String(existingRow[COL.DEPARTMENT] ?? ""),
        jobType: String(existingRow[COL.JOB_TYPE] ?? ""),
        needDate: formatDateCell(existingRow[COL.NEED_DATE]),
      });
    } catch (err) {
      console.error("LINE assign-notify failed for job", payload.id, err);
    }
  }

  if (payload.status === "เสร็จสิ้น") {
    const sheet2Id = config.sheet2.id();
    const tab2 = config.sheet2.resourceUsageTab();
    const emptyItems: ResourceLineItem[] = [{}, {}, {}];
    const res = payload.resources && payload.resources.length ? payload.resources : emptyItems;
    const [r0, r1, r2] = [res[0] ?? {}, res[1] ?? {}, res[2] ?? {}];

    const newRow = [
      payload.id,
      nowAsSheetsDateTime(),
      "เสร็จสิ้น",
      payload.doneDate || "",
      r0.name || "",
      r0.qty || "",
      r0.color || "",
      r0.size || "",
      r1.name || "",
      r1.qty || "",
      r1.color || "",
      r1.size || "",
      r2.name || "",
      r2.qty || "",
      r2.color || "",
      r2.size || "",
    ];

    const rows2 = await getSheetValues(sheet2Id, tab2);
    let existRow = -1;
    for (let i = 1; i < rows2.length; i++) {
      if (String(rows2[i][0]).trim() === String(payload.id).trim()) {
        existRow = i + 1;
        break;
      }
    }

    if (existRow !== -1) {
      await updateRow(sheet2Id, tab2, existRow, newRow);
    } else {
      await appendRow(sheet2Id, tab2, newRow);
    }
  }

  return true;
}
