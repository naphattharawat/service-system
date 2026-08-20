import { Readable } from "stream";
import { google, drive_v3 } from "googleapis";
import { config } from "./config";

let authClient: InstanceType<typeof google.auth.OAuth2> | null = null;
let driveClient: drive_v3.Drive | null = null;

// Authenticates as a real Google account (via a long-lived refresh token)
// rather than the service account used for Sheets/Calendar: bare service
// accounts have zero Drive storage quota, so they can't own any uploaded
// file on a personal Gmail account (no Shared Drives, no domain-wide
// delegation available). See scripts/get-drive-refresh-token.mjs.
function getAuth() {
  if (!authClient) {
    authClient = new google.auth.OAuth2(
      config.google.oauthClientId(),
      config.google.oauthClientSecret()
    );
    authClient.setCredentials({ refresh_token: config.google.oauthRefreshToken() });
  }
  return authClient;
}

function getDrive(): drive_v3.Drive {
  if (!driveClient) {
    driveClient = google.drive({ version: "v3", auth: getAuth() });
  }
  return driveClient;
}

export function folderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

export function fileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/** Equivalent of `parentFolder.createFolder(name)`. */
export async function createFolder(parentFolderId: string, name: string): Promise<string> {
  const res = await getDrive().files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id",
    supportsAllDrives: true,
  });
  const id = res.data.id;
  if (!id) throw new Error(`Failed to create Drive folder "${name}"`);
  return id;
}

/** Equivalent of `folder.createFile(blob)` from a base64 payload. */
export async function uploadFile(
  parentFolderId: string,
  name: string,
  mimeType: string,
  base64Data: string
): Promise<string> {
  const buffer = Buffer.from(base64Data, "base64");
  const res = await getDrive().files.create({
    requestBody: { name, parents: [parentFolderId] },
    media: { mimeType: mimeType || "application/octet-stream", body: Readable.from(buffer) },
    fields: "id",
    supportsAllDrives: true,
  });
  const id = res.data.id;
  if (!id) throw new Error(`Failed to upload file "${name}" to Drive`);
  return id;
}

/** Equivalent of `file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)`. */
export async function shareAnyoneWithLinkView(fileId: string): Promise<void> {
  await getDrive().permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
    supportsAllDrives: true,
  });
}
