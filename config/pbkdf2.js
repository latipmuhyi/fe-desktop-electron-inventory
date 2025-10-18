// config/pbkdf2.js
const crypto = require("crypto");
const { promisify } = require("util");

const pbkdf2 = promisify(crypto.pbkdf2);

const DEFAULTS = {
  iterations: 100000,
  keylen: 64,
  digest: "sha512",
  saltBytes: 16, 
};

async function hashPassword(password, opts = {}) {
  const { iterations, keylen, digest, saltBytes } = { ...DEFAULTS, ...opts };
  const salt = crypto.randomBytes(saltBytes);
  const derivedKey = await pbkdf2(password, salt, iterations, keylen, digest);

  // simpan dalam format: iterations:saltHex:hashHex
  return `${iterations}:${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string") return false;
  const parts = stored.split(":");
  if (parts.length !== 3) return false;

  const iterations = parseInt(parts[0], 10);
  const salt = Buffer.from(parts[1], "hex");
  const hash = Buffer.from(parts[2], "hex");

  const derivedKey = await pbkdf2(
    password,
    salt,
    iterations,
    hash.length,
    DEFAULTS.digest
  );
  return crypto.timingSafeEqual(derivedKey, hash);
}

module.exports = {
  hashPassword,
  verifyPassword,
  DEFAULTS,
};
