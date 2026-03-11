const { Readable } = require("stream");

const DRIVE_UPLOAD_SCOPE = "https://www.googleapis.com/auth/drive.file";

function normalizeCategoryToken(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "";
  }
  if (raw === "accessories") {
    return "accessory";
  }
  return raw.replace(/[\s_]+/g, "-");
}

function parseFolderMapFromEnv(rawValue) {
  const source = String(rawValue || "").trim();
  if (!source) {
    return {};
  }
  try {
    const parsed = JSON.parse(source);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const map = {};
    Object.entries(parsed).forEach(([key, value]) => {
      const token = normalizeCategoryToken(key);
      const folderId = String(value || "").trim();
      if (token && folderId) {
        map[token] = folderId;
      }
    });
    return map;
  } catch (error) {
    return {};
  }
}

function readDriveConfig() {
  const serviceAccountEmail = String(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL || "").trim();
  const privateKey = String(process.env.GOOGLE_DRIVE_PRIVATE_KEY || "").replace(/\\n/g, "\n").trim();
  const parentFolderId = String(process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || "").trim();
  const makePublic = String(process.env.GOOGLE_DRIVE_MAKE_PUBLIC || "true").toLowerCase() !== "false";
  const categoryFolderMap = parseFolderMapFromEnv(process.env.GOOGLE_DRIVE_CATEGORY_FOLDER_MAP_JSON);
  return {
    serviceAccountEmail,
    privateKey,
    parentFolderId,
    makePublic,
    categoryFolderMap
  };
}

function getGoogleApis() {
  try {
    return require("googleapis");
  } catch (error) {
    return null;
  }
}

function isDriveConfigured() {
  const googleApis = getGoogleApis();
  const config = readDriveConfig();
  return Boolean(googleApis && config.serviceAccountEmail && config.privateKey);
}

function createDriveClient() {
  const googleApis = getGoogleApis();
  if (!googleApis) {
    const error = new Error("Missing backend dependency `googleapis`.");
    error.code = "DRIVE_DEPENDENCY_MISSING";
    throw error;
  }

  const config = readDriveConfig();
  if (!config.serviceAccountEmail || !config.privateKey) {
    const error = new Error("Google Drive service account is not configured.");
    error.code = "DRIVE_NOT_CONFIGURED";
    throw error;
  }

  const auth = new googleApis.google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: [DRIVE_UPLOAD_SCOPE]
  });
  const drive = googleApis.google.drive({ version: "v3", auth });
  return { drive, config };
}

function parseDataUrl(dataUrl) {
  const source = String(dataUrl || "").trim();
  const match = source.match(/^data:([^;]+);base64,(.+)$/i);
  if (!match) {
    throw new Error("Invalid media payload. Expected base64 data URL.");
  }
  const mimeType = String(match[1] || "application/octet-stream").trim().toLowerCase();
  const payload = String(match[2] || "").trim();
  if (!payload) {
    throw new Error("Empty media payload.");
  }
  const buffer = Buffer.from(payload, "base64");
  if (!buffer.length) {
    throw new Error("Unable to decode media payload.");
  }
  return { mimeType, buffer };
}

function sanitizeFilename(value) {
  const raw = String(value || "").trim();
  const clean = raw
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) {
    return `upload-${Date.now()}`;
  }
  return clean.slice(0, 180);
}

async function uploadBufferToDrive({ buffer, mimeType, fileName, parentFolderId = "", category = "" }) {
  const { drive, config } = createDriveClient();
  const normalizedCategory = normalizeCategoryToken(category);
  const categoryFolderId = normalizedCategory
    ? String((config.categoryFolderMap && config.categoryFolderMap[normalizedCategory]) || "").trim()
    : "";
  const folderId = String(parentFolderId || categoryFolderId || config.parentFolderId || "").trim();
  const requestBody = {
    name: sanitizeFilename(fileName),
    mimeType: String(mimeType || "application/octet-stream")
  };
  if (folderId) {
    requestBody.parents = [folderId];
  }

  const response = await drive.files.create({
    requestBody,
    media: {
      mimeType: requestBody.mimeType,
      body: Readable.from(buffer)
    },
    fields: "id,name,mimeType,size,webViewLink,webContentLink"
  });

  const uploaded = response && response.data ? response.data : {};
  if (!uploaded.id) {
    throw new Error("Google Drive upload failed: no file id returned.");
  }

  if (config.makePublic) {
    await drive.permissions.create({
      fileId: uploaded.id,
      requestBody: {
        role: "reader",
        type: "anyone"
      }
    });
  }

  return {
    id: uploaded.id,
    name: uploaded.name || requestBody.name,
    mimeType: uploaded.mimeType || requestBody.mimeType,
    size: Number(uploaded.size || buffer.length || 0),
    webViewLink: uploaded.webViewLink || "",
    webContentLink: uploaded.webContentLink || "",
    directUrl: `https://drive.google.com/uc?export=view&id=${uploaded.id}`
  };
}

module.exports = {
  isDriveConfigured,
  parseDataUrl,
  uploadBufferToDrive
};
