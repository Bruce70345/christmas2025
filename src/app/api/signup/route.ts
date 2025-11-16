import { NextResponse } from "next/server";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createSign,
  randomBytes,
} from "node:crypto";
import type { SignupEntry, SignupPayload } from "@/types/signup";

const FALLBACK_SHEET_ID = "1jOxnQijJhzGyPVR9G8LgQMrAGJV39nLpZPoYVis1Afw";
const FALLBACK_RANGE = "Christmas!A1:F";

const SHEET_ID = process.env.GOOGLE_SHEET_ID ?? FALLBACK_SHEET_ID;
const SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE ?? FALLBACK_RANGE;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const RAW_SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const GOOGLE_TOKEN_AUDIENCE = "https://oauth2.googleapis.com/token";
const GOOGLE_SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DATA_ENCRYPTION_SECRET =
  process.env.DATA_ENCRYPTION_SECRET ??
  process.env.NEXT_PUBLIC_DATA_ENCRYPTION_SECRET ??
  "dev-christmas-secret";
const ENCRYPTION_KEY = createHash("sha256")
  .update(DATA_ENCRYPTION_SECRET)
  .digest();
const GCM_IV_LENGTH = 12;
const LOG_PREFIX = "[api/signup]";

type CachedToken = {
  token: string;
  expiresAt: number;
};

let cachedToken: CachedToken | null = null;

type SheetAppendResponse = {
  spreadsheetId?: string;
  tableRange?: string;
  updates?: {
    updatedRange?: string;
    updatedRows?: number;
    updatedColumns?: number;
    updatedCells?: number;
  };
  error?: { message?: string };
};

type SheetValuesResponse = {
  values?: string[][];
};

function mapRowToEntry(row: string[]): SignupEntry {
  return {
    timestamp: row[0] ?? "",
    name: decryptValue(row[1] ?? ""),
    address: decryptValue(row[2] ?? ""),
    postcardTheme: decryptValue(row[3] ?? ""),
    contact: decryptValue(row[4] ?? ""),
    songSuggestion: row[5] ?? "",
  };
}

function sanitize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePayload(payload: Partial<SignupPayload>) {
  const name = sanitize(payload.name);
  const address = sanitize(payload.address);
  const postcardTheme = sanitize(payload.postcardTheme);
  const contact = sanitize(payload.contact);
  const songSuggestion = sanitize(payload.songSuggestion);

  if (!name) {
    return { error: "Please fill up Your Name。" };
  }
  if (!address) {
    return { error: "Please fill up Your Address" };
  }
  if (!postcardTheme) {
    return { error: "Please pick a Postcard Theme" };
  }

  return {
    data: {
      name,
      address,
      postcardTheme,
      contact,
      songSuggestion,
    },
  };
}

function getServiceAccountKey() {
  if (!RAW_SERVICE_ACCOUNT_KEY) return null;
  return RAW_SERVICE_ACCOUNT_KEY.replace(/\\n/g, "\n");
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function encryptValue(value?: string) {
  if (!value) return "";
  const iv = randomBytes(GCM_IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(textEncoder.encode(value)),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${authTag.toString("base64")}.${encrypted.toString("base64")}`;
}

function decryptValue(value: string) {
  if (!value) return "";
  const [ivBase64, tagBase64, payloadBase64] = value.split(".");
  if (!ivBase64 || !tagBase64 || !payloadBase64) {
    return value;
  }
  try {
    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(tagBase64, "base64");
    const payload = Buffer.from(payloadBase64, "base64");
    const decipher = createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(payload),
      decipher.final(),
    ]);
    return textDecoder.decode(decrypted);
  } catch {
    return value;
  }
}

function toBase64Url(value: string | Record<string, unknown>) {
  const serialized =
    typeof value === "string" ? value : JSON.stringify(value);
  return Buffer.from(serialized)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createServiceAccountAssertion() {
  if (!SERVICE_ACCOUNT_EMAIL) {
    throw new Error("缺少 GOOGLE_SERVICE_ACCOUNT_EMAIL 環境變數。");
  }

  const privateKey = getServiceAccountKey();
  if (!privateKey) {
    throw new Error("缺少 GOOGLE_SERVICE_ACCOUNT_KEY 環境變數。");
  }

  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: GOOGLE_SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_AUDIENCE,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  };

  const unsignedToken = `${toBase64Url(header)}.${toBase64Url(payload)}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const signature = signer.sign(privateKey, "base64");
  const signatureUrlSafe = signature
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${unsignedToken}.${signatureUrlSafe}`;
}

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const assertion = createServiceAccountAssertion();
  const tokenResponse = await fetch(GOOGLE_TOKEN_AUDIENCE, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    throw new Error(
      `Google OAuth 失敗：${errorBody || tokenResponse.statusText}`,
    );
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!tokenData.access_token || !tokenData.expires_in) {
    throw new Error("取得 Google access token 失敗。");
  }

  cachedToken = {
    token: tokenData.access_token,
    expiresAt: now + tokenData.expires_in * 1000,
  };

  return cachedToken.token;
}

export async function POST(request: Request) {
  if (!SHEET_ID || !SHEET_RANGE) {
    console.error(`${LOG_PREFIX} Missing sheet config`, {
      hasSheetId: Boolean(SHEET_ID),
      hasRange: Boolean(SHEET_RANGE),
    });
    return NextResponse.json(
      { error: "Google Sheet 設定缺失。" },
      { status: 500 },
    );
  }

  let payload: Partial<SignupPayload>;
  try {
    payload = await request.json();
  } catch {
    console.error(`${LOG_PREFIX} Invalid JSON payload`);
    return NextResponse.json(
      { error: "無效的 JSON 格式。" },
      { status: 400 },
    );
  }

  const result = validatePayload(payload);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { name, address, postcardTheme, contact, songSuggestion } = result.data;

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (tokenError) {
    console.error(`${LOG_PREFIX} getAccessToken failed`, tokenError);
    return NextResponse.json(
      {
        error:
          tokenError instanceof Error
            ? tokenError.message
            : "Google OAuth 取得 token 失敗。",
      },
      { status: 500 },
    );
  }

  const endpoint = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_RANGE)}:append`,
  );
  endpoint.searchParams.set("valueInputOption", "USER_ENTERED");
  endpoint.searchParams.set("insertDataOption", "INSERT_ROWS");

  const values = [
    [
      new Date().toISOString(),
      encryptValue(name),
      encryptValue(address),
      encryptValue(postcardTheme),
      encryptValue(contact),
      songSuggestion ?? "",
    ],
  ];

  const sheetResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ values }),
  });

  if (!sheetResponse.ok) {
    let errorMessage = "寫入 Google Sheet 失敗。";

    try {
      const errorBody = (await sheetResponse.json()) as SheetAppendResponse;
      errorMessage =
        errorBody.error?.message ??
        errorMessage;
      console.error(`${LOG_PREFIX} Sheet append error`, errorBody);
    } catch (parseError) {
      console.error(`${LOG_PREFIX} Failed to parse sheet append error`, parseError);
      // ignore parse errors and fall back to generic message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: sheetResponse.status ?? 502 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function GET() {
  if (!SHEET_ID || !SHEET_RANGE) {
    console.error(`${LOG_PREFIX} Missing sheet config for GET`, {
      hasSheetId: Boolean(SHEET_ID),
      hasRange: Boolean(SHEET_RANGE),
    });
    return NextResponse.json(
      { error: "Google Sheet 設定缺失。" },
      { status: 500 },
    );
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch (tokenError) {
    console.error(`${LOG_PREFIX} getAccessToken failed (GET)`, tokenError);
    return NextResponse.json(
      {
        error:
          tokenError instanceof Error
            ? tokenError.message
            : "Google OAuth 取得 token 失敗。",
      },
      { status: 500 },
    );
  }

  const endpoint = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_RANGE)}`,
  );
  endpoint.searchParams.set("valueRenderOption", "UNFORMATTED_VALUE");

  const sheetResponse = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!sheetResponse.ok) {
    let errorMessage = "讀取 Google Sheet 失敗。";

    try {
      const errorBody = (await sheetResponse.json()) as SheetAppendResponse;
      errorMessage =
        errorBody.error?.message ??
        errorMessage;
      console.error(`${LOG_PREFIX} Sheet read error`, errorBody);
    } catch (parseError) {
      console.error(`${LOG_PREFIX} Failed to parse sheet read error`, parseError);
      // ignore parse errors
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: sheetResponse.status ?? 502 },
    );
  }

  const sheetData = (await sheetResponse.json()) as SheetValuesResponse;
  const entries = (sheetData.values ?? [])
    .filter((row) => row.length > 0)
    .map(mapRowToEntry);

  return NextResponse.json({ entries }, { status: 200 });
}
