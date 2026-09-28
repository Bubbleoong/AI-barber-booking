import { AppError } from "@/lib/errors";

export async function readJsonBody(request: Request, maxBytes = 8192): Promise<unknown> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes)
    throw new AppError("BODY_TOO_LARGE", "ข้อมูลที่ส่งมีขนาดใหญ่เกินไป", 413);
  if (!request.body) throw new AppError("INVALID_JSON", "ข้อมูลไม่ถูกต้อง", 400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes)
        throw new AppError("BODY_TOO_LARGE", "ข้อมูลที่ส่งมีขนาดใหญ่เกินไป", 413);
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}
