import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb/connect";
import { openwaConfig } from "@/lib/openwa";

function secret() {
  if (!process.env.NEXTAUTH_SECRET) throw new Error("NEXTAUTH_SECRET is required to store integration credentials.");
  return createHash("sha256").update(process.env.NEXTAUTH_SECRET).digest();
}
export function encryptWhatsAppKey(value: string) {
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", secret(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map(part => part.toString("base64")).join(".");
}
function decrypt(value: string) {
  const [iv, tag, data] = value.split(".").map(part => Buffer.from(part, "base64"));
  const cipher = createDecipheriv("aes-256-gcm", secret(), iv); cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(data), cipher.final()]).toString("utf8");
}
export async function whatsappSettingsCollection() {
  await connectToDatabase();
  return mongoose.connection.collection<{ _id: string; url: string; encryptedKey: string; siteUrl: string; replyLocale: "ar" | "en"; updatedAt: Date }>("integration_settings");
}
export async function savedWhatsAppSettings() { return (await whatsappSettingsCollection()).findOne({ _id: "whatsapp" }); }
export async function resolvedWhatsAppConfig() {
  const saved = await savedWhatsAppSettings();
  return saved ? { url: saved.url, key: decrypt(saved.encryptedKey), siteUrl: saved.siteUrl, replyLocale: saved.replyLocale } : openwaConfig();
}
