export type Result<T,E= AppError> = |{ ok: true; value: T } | { ok: false; error: E };
export type AppError = {
  code?: number;
  message: string;
  cause?: unknown;
};