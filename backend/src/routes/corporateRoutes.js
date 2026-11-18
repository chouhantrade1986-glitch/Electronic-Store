const express = require("express");
const { createHash, randomBytes, timingSafeEqual } = require("crypto");
const { readDb, writeDb, withWriteLock } = require("../lib/db");
const { requireAuth } = require("../middleware/authMiddleware");
const router = express.Router();

const REGISTRY_OCCASIONS = new Set(["diwali", "new_year", "rewards", "milestone", "general"]);

function hashShareToken(token) {
  return createHash("sha256").update(String(token || ""), "utf8").digest();
}

function matchesShareToken(candidate, storedHash) {
  if (!candidate || !storedHash) return false;
  const candidateHash = hashShareToken(candidate);
  const savedHash = Buffer.from(String(storedHash), "hex");
  return savedHash.length === candidateHash.length && timingSafeEqual(savedHash, candidateHash);
}

function optionalAuth(req, res, next) {
  if (!req.headers.authorization) return next();
  return requireAuth(req, res, next);
}

function normalizeRegistryItem(value) {
  const productId = String(value && value.productId || "").trim();
  const quantity = Number(value && value.quantity);
  if (!/^[a-z0-9][a-z0-9_-]{1,39}$/i.test(productId)
    || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    return null;
  }
  return { productId, quantity };
}

function normalizeRegistryItems(value) {
  if (!Array.isArray(value) || value.length > 100) return null;
  const items = [];
  for (const rawItem of value) {
    const item = normalizeRegistryItem(rawItem);
    if (!item) return null;
    const existing = items.find((entry) => entry.productId === item.productId);
    if (existing) {
      existing.quantity += item.quantity;
      if (existing.quantity > 999) return null;
    } else {
      items.push(item);
    }
  }
  return items;
}

function normalizeRecipients(value) {
  if (!Array.isArray(value) || value.length > 500) return null;
  const recipients = [];
  for (const rawRecipient of value) {
    const name = String(rawRecipient && rawRecipient.name || "").trim();
    const email = String(rawRecipient && rawRecipient.email || "").trim().toLowerCase();
    if (name.length > 120 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return null;
    }
    recipients.push({ recipientName: name, recipientEmail: email });
  }
  return recipients;
}

function isValidEventDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))
    && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
}

function publicRegistry(registry) {
  const visibleRegistry = { ...registry };
  delete visibleRegistry.shareTokenHash;
  delete visibleRegistry.createdBy;
  delete visibleRegistry.organizationId;
  return {
    ...visibleRegistry,
    recipients: (Array.isArray(registry.recipients) ? registry.recipients : []).map((recipient) => ({
      name: recipient.recipientName,
      email: recipient.recipientEmail
    }))
  };
}

function canAccessRegistry(req, registry, token) {
  if (matchesShareToken(token, registry.shareTokenHash)) return true;
  if (!req.user) return false;
  return registry.createdBy === req.user.id
    || Boolean(registry.organizationId && req.user.organizationId === registry.organizationId);
}

router.post("/registry", requireAuth, async (req, res, next) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const registryName = String(body.registryName || "").trim();
  const occasion = String(body.occasion || "general").trim().toLowerCase();
  const eventDate = String(body.eventDate || "").trim();
  const items = normalizeRegistryItems(body.items);
  const recipients = normalizeRecipients(body.recipients);
  if (!registryName || registryName.length > 120
    || !REGISTRY_OCCASIONS.has(occasion)
    || !isValidEventDate(eventDate)
    || !items || !recipients) {
    return res.status(400).json({ message: "Registry details are invalid." });
  }

  const shareToken = randomBytes(32).toString("hex");
  const registry = {
    id: `EM-CG-REG-${randomBytes(12).toString("hex").toUpperCase()}`,
    registryName,
    occasion,
    eventDate,
    items,
    recipients,
    createdBy: req.user.id,
    organizationId: req.user.organizationId || "",
    shareTokenHash: hashShareToken(shareToken).toString("hex"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await withWriteLock(async () => {
      const db = readDb();
      if (!Array.isArray(db.corporateRegistries)) db.corporateRegistries = [];
      db.corporateRegistries.push(registry);
      writeDb(db);
    });
  } catch (error) {
    return next(error);
  }

  return res.status(201).json({ registry: publicRegistry(registry), shareToken });
});

router.get("/registry/:id", optionalAuth, (req, res) => {
  const db = readDb();
  const registry = (Array.isArray(db.corporateRegistries) ? db.corporateRegistries : [])
    .find((entry) => entry.id === req.params.id);
  if (!registry) return res.status(404).json({ message: "Corporate registry not found." });

  const shareToken = String(req.get("x-corporate-share-token") || "").trim();
  if (!canAccessRegistry(req, registry, shareToken)) {
    return res.status(req.user ? 403 : 401).json({ message: "You are not authorized to view this registry." });
  }
  return res.json({ registry: publicRegistry(registry) });
});

router.post("/registry/:id/share-token", requireAuth, async (req, res, next) => {
  let responseStatus = 200;
  let responseBody;
  try {
    await withWriteLock(async () => {
      const db = readDb();
      const registry = (Array.isArray(db.corporateRegistries) ? db.corporateRegistries : [])
        .find((entry) => entry.id === req.params.id);
      if (!registry) {
        responseStatus = 404;
        responseBody = { message: "Corporate registry not found." };
        return;
      }
      if (registry.createdBy !== req.user.id
        && !(registry.organizationId && req.user.organizationId === registry.organizationId)) {
        responseStatus = 403;
        responseBody = { message: "Only an authorized organization member can rotate this share link." };
        return;
      }

      const shareToken = randomBytes(32).toString("hex");
      registry.shareTokenHash = hashShareToken(shareToken).toString("hex");
      registry.updatedAt = new Date().toISOString();
      writeDb(db);
      responseBody = { shareToken };
    });
  } catch (error) {
    return next(error);
  }
  return res.status(responseStatus).json(responseBody);
});

router.patch("/registry/:id/items", optionalAuth, async (req, res, next) => {
  const item = normalizeRegistryItem(req.body);
  if (!item) return res.status(400).json({ message: "Registry item details are invalid." });

  let responseStatus = 200;
  let responseBody;
  try {
    await withWriteLock(async () => {
      const db = readDb();
      if (!Array.isArray(db.corporateRegistries)) db.corporateRegistries = [];
      const registry = db.corporateRegistries.find((entry) => entry.id === req.params.id);
      if (!registry) {
        responseStatus = 404;
        responseBody = { message: "Corporate registry not found." };
        return;
      }

      const shareToken = String(req.get("x-corporate-share-token") || "").trim();
      if (!canAccessRegistry(req, registry, shareToken)) {
        responseStatus = req.user ? 403 : 401;
        responseBody = { message: "You are not authorized to update this registry." };
        return;
      }

      const existing = registry.items.find((entry) => entry.productId === item.productId);
      if (existing && existing.quantity + item.quantity > 999) {
        responseStatus = 400;
        responseBody = { message: "Registry item quantity exceeds the allowed limit." };
        return;
      }
      if (existing) existing.quantity += item.quantity;
      else if (registry.items.length < 100) registry.items.push(item);
      else {
        responseStatus = 400;
        responseBody = { message: "A registry cannot contain more than 100 products." };
        return;
      }

      registry.updatedAt = new Date().toISOString();
      writeDb(db);
      responseBody = { registry: publicRegistry(registry) };
    });
  } catch (error) {
    return next(error);
  }

  return res.status(responseStatus).json(responseBody);
});

module.exports = router;
