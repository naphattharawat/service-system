function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  google: {
    serviceAccountEmail: () => required("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    // .env files store the key with literal "\n" sequences; the Google auth
    // libraries need actual newlines.
    serviceAccountPrivateKey: () =>
      required("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n"),
    calendarApiKey: () => required("GOOGLE_CALENDAR_API_KEY"),
    // Drive uploads authenticate as a real Google account via OAuth instead
    // of the service account: personal Gmail accounts have no Shared Drives
    // and no domain-wide delegation, and bare service accounts have zero
    // storage quota of their own, so they can't own any uploaded file.
    // See scripts/get-drive-refresh-token.mjs for how to obtain these.
    oauthClientId: () => required("GOOGLE_OAUTH_CLIENT_ID"),
    oauthClientSecret: () => required("GOOGLE_OAUTH_CLIENT_SECRET"),
    oauthRefreshToken: () => required("GOOGLE_OAUTH_REFRESH_TOKEN"),
  },
  sheet1: {
    id: () => required("SHEET1_ID"),
    jobsTab: () => process.env.SHEET1_NAME || "การตอบแบบฟอร์ม 1",
    usersTab: () => process.env.USERS_SHEET_NAME || "users",
    loginLogTab: () => process.env.LOGIN_LOG_SHEET_NAME || "LoginLog",
    settingsTab: () => process.env.SETTINGS_SHEET_NAME || "Settings",
  },
  sheet2: {
    id: () => required("SHEET2_ID"),
    resourceUsageTab: () => process.env.SHEET2_NAME || "การตอบแบบฟอร์ม 1",
    resourceListTab: () => process.env.RESOURCE_LIST_SHEET_NAME || "ResourceList",
  },
  drive: {
    folderId: () => required("DRIVE_FOLDER_ID"),
  },
  session: {
    secret: () => required("SESSION_SECRET"),
  },
  lineNotify: {
    // MOPH's internal LINE notify gateway (not the old public LINE Notify
    // service) — client-key/secret-key identify the preconfigured OA/group
    // this broadcasts to, no per-recipient "to" field needed.
    url: () => process.env.LINE_NOTIFY_URL || "https://morpromt2f.moph.go.th/api/notify/send",
    clientKey: () => required("LINE_NOTIFY_CLIENT_KEY"),
    secretKey: () => required("LINE_NOTIFY_SECRET_KEY"),
  },
};
