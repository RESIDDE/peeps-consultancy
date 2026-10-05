import path from "node:path";

/** Local storage for candidate documents. Swap for S3/R2 in production. */
export const UPLOAD_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");
