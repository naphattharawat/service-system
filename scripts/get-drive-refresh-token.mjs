// One-time setup script: obtains a Google OAuth refresh token for whichever
// Google account you sign in with, scoped to Drive. Run this once, paste the
// printed refresh token into .env.local, and lib/drive.ts uses it from then
// on (instead of the service account) so uploaded files count against your
// own normal Drive storage.
//
// Prerequisite: create an OAuth Client ID in Google Cloud Console
// (APIs & Services -> Credentials -> Create Credentials -> OAuth client ID),
// Application type "Desktop app". Put its Client ID/Secret into .env.local
// as GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET before running this.
//
// Usage:  node scripts/get-drive-refresh-token.mjs

import { createServer } from "node:http";
import { google } from "googleapis";

process.loadEnvFile(new URL("../.env.local", import.meta.url));

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error(
    "Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET in .env.local.\n" +
      "Create an OAuth Client ID (Desktop app) in Google Cloud Console first."
  );
  process.exit(1);
}

const PORT = 3001;
const redirectUri = `http://localhost:${PORT}/oauth2callback`;
const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // force a refresh_token even if this account authorized before
  // drive.file (not the full "drive" scope) — this app only ever creates
  // folders/files and shares what it just created (see lib/drive.ts), and
  // unlike "drive" it isn't a Google "restricted" scope, so it can reach
  // "In production" by self-publish instead of requiring Google's full
  // brand/domain verification review.
  scope: ["https://www.googleapis.com/auth/drive.file"],
});

const server = createServer(async (req, res) => {
  if (!req.url?.startsWith("/oauth2callback")) {
    res.writeHead(404).end();
    return;
  }
  const url = new URL(req.url, redirectUri);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" }).end(
      `<p>เกิดข้อผิดพลาด: ${error} — ปิดหน้านี้แล้วลองใหม่</p>`
    );
    console.error("Authorization failed:", error);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400).end("Missing code");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(
      "<p>สำเร็จ! ปิดหน้านี้แล้วกลับไปดู terminal ได้เลย</p>"
    );
    console.log("\n=== Success ===");
    if (tokens.refresh_token) {
      console.log("Add this line to .env.local:\n");
      console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    } else {
      console.log(
        "No refresh_token was returned — this Google account probably already has one\n" +
          "issued for this OAuth client. Revoke access at https://myaccount.google.com/permissions\n" +
          "and run this script again."
      );
    }
  } catch (err) {
    console.error("Token exchange failed:", err instanceof Error ? err.message : err);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log("Open this URL, sign in with the Google account that owns the Drive folder,");
  console.log("and approve access:\n");
  console.log(authUrl);
  console.log(`\nWaiting for the redirect on http://localhost:${PORT} ...`);
});
