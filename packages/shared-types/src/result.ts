import type { AppErrorCode } from "./errors";
export type Result<T,E= AppError> = |{ ok: true; value: T } | { ok: false; error: E };
export type AppError = {
  code: AppErrorCode;
  message: string;
  cause?: unknown;
};