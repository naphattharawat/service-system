import { config } from "./config";
import { appendRow, deleteRow, getSheetValues, updateCell } from "./sheets";
import { nowAsSheetsDateTime } from "./date-utils";
import { HttpError, NotFoundError } from "./errors";
import type { AppUser, Role } from "@/types";

// 0-based columns in the "users" tab: username, password, role, name, active.
const COL = { USER: 0, PASS: 1, ROLE: 2, NAME: 3, ACTIVE: 4 } as const;

function isActiveTrue(value: unknown): boolean {
  return String(value).trim().toLowerCase() === "true";
}

export interface LoginResult {
  success: boolean;
  user?: string;
  role?: Role;
  name?: string;
}

export async function checkLogin(username: string, password: string): Promise<LoginResult> {
  const sheetId = config.sheet1.id();
  const rows = await getSheetValues(sheetId, config.sheet1.usersTab());
  const u = String(username).trim();
  const p = String(password).trim();

  for (let i = 1; i < rows.length; i++) {
    if (
      String(rows[i][COL.USER]).trim() === u &&
      String(rows[i][COL.PASS]).trim() === p &&
      isActiveTrue(rows[i][COL.ACTIVE])
    ) {
      try {
        await appendRow(sheetId, config.sheet1.loginLogTab(), [
          nowAsSheetsDateTime(),
          rows[i][COL.USER],
          rows[i][COL.NAME],
          rows[i][COL.ROLE],
          "Web",
        ]);
      } catch {
        // Login still succeeds even if the log write fails, matching the legacy try/catch.
      }
      return {
        success: true,
        user: String(rows[i][COL.USER]),
        role: rows[i][COL.ROLE] as Role,
        name: String(rows[i][COL.NAME]),
      };
    }
  }
  return { success: false };
}

export async function getUsers(): Promise<AppUser[]> {
  const rows = await getSheetValues(config.sheet1.id(), config.sheet1.usersTab());
  const result: AppUser[] = [];
  for (let i = 1; i < rows.length; i++) {
    result.push({
      user: String(rows[i][COL.USER]),
      role: rows[i][COL.ROLE] as Role,
      name: String(rows[i][COL.NAME]),
      active: isActiveTrue(rows[i][COL.ACTIVE]),
    });
  }
  return result;
}

export async function addUser(
  user: string,
  pass: string,
  role: Role,
  name: string
): Promise<true> {
  const sheetId = config.sheet1.id();
  const tab = config.sheet1.usersTab();
  const rows = await getSheetValues(sheetId, tab);
  const u = String(user).trim();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][COL.USER]).trim() === u) {
      throw new HttpError(400, "มี Username นี้ในระบบแล้ว");
    }
  }

  await appendRow(sheetId, tab, [u, pass, role, name, true]);
  return true;
}

export async function toggleUserStatus(user: string, currentActive: boolean): Promise<true> {
  const sheetId = config.sheet1.id();
  const tab = config.sheet1.usersTab();
  const rows = await getSheetValues(sheetId, tab);

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][COL.USER]).trim() === String(user).trim()) {
      await updateCell(sheetId, tab, i + 1, COL.ACTIVE + 1, !currentActive);
      return true;
    }
  }
  throw new NotFoundError("ไม่พบ User");
}

export async function deleteUser(user: string): Promise<boolean> {
  const sheetId = config.sheet1.id();
  const tab = config.sheet1.usersTab();
  const rows = await getSheetValues(sheetId, tab);
  const u = String(user).trim();

  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][COL.USER]).trim() === u) {
      await deleteRow(sheetId, tab, i + 1);
      return true;
    }
  }
  return false;
}

export interface ChangeProfileInput {
  user: string;
  oldPw: string;
  newPw?: string;
  newUser?: string;
}

export interface ChangeProfileResult {
  success: boolean;
  msg?: string;
  newUsername?: string;
}

export async function changeUserProfile(input: ChangeProfileInput): Promise<ChangeProfileResult> {
  const sheetId = config.sheet1.id();
  const tab = config.sheet1.usersTab();
  const rows = await getSheetValues(sheetId, tab);
  const user = String(input.user).trim();
  const oldPw = String(input.oldPw).trim();
  const newPw = input.newPw ? String(input.newPw).trim() : null;
  const newUser = input.newUser ? String(input.newUser).trim() : null;

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][COL.USER]).trim() === user) {
      rowIndex = i;
      break;
    }
  }
  if (rowIndex === -1) return { success: false, msg: "ไม่พบบัญชีผู้ใช้" };
  if (String(rows[rowIndex][COL.PASS]).trim() !== oldPw) {
    return { success: false, msg: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
  }

  if (newUser && newUser !== user) {
    for (let i = 1; i < rows.length; i++) {
      if (i !== rowIndex && String(rows[i][COL.USER]).trim() === newUser) {
        return { success: false, msg: "Username นี้มีคนใช้แล้ว" };
      }
    }
    await updateCell(sheetId, tab, rowIndex + 1, COL.USER + 1, newUser);
  }
  if (newPw) await updateCell(sheetId, tab, rowIndex + 1, COL.PASS + 1, newPw);

  return { success: true, newUsername: newUser && newUser !== user ? newUser : undefined };
}
