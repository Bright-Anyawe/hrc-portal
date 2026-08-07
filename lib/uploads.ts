import "server-only";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export async function saveUpload(
  file: File
): Promise<{ name: string; fileUrl: string }> {
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength > MAX_FILE_SIZE) {
    throw new Error("File exceeds the 10MB limit.");
  }

  const stored = `${Date.now()}-${randomBytes(4).toString("hex")}-${sanitizeFilename(file.name) || "file"}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, stored), bytes);

  return { name: file.name || stored, fileUrl: `/uploads/${stored}` };
}
