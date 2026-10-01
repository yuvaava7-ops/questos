import "server-only";
import { createHash, randomBytes } from "node:crypto";

export const TOKEN_PREFIX = "qos_";

export function generateApiToken(): string {
  return TOKEN_PREFIX + randomBytes(32).toString("base64url");
}

// Tokens are 256-bit random, so a plain SHA-256 (no salt/KDF) is enough:
// there is nothing to brute-force.
export function hashApiToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
