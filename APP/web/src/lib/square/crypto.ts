import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getSquareTokenEncryptionKey } from "./config";

const VERSION = "v1";
const IV_BYTES = 12;

export function encryptSquareToken(plaintext: string): string {
  if (!plaintext) throw new Error("Cannot encrypt an empty Square token.");
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getSquareTokenEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptSquareToken(packed: string): string {
  const [version, ivPart, tagPart, ciphertextPart] = packed.split(".");
  if (version !== VERSION || !ivPart || !tagPart || !ciphertextPart) throw new Error("Unsupported encrypted Square token.");
  const decipher = createDecipheriv("aes-256-gcm", getSquareTokenEncryptionKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
