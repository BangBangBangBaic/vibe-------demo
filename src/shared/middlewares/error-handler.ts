import type { Context, Next } from "koa";
import { AppError } from "../errors/app-error";

export async function errorHandler(ctx: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (error: unknown) {
    if (error instanceof AppError) {
      ctx.status = error.status;
      ctx.body = {
        code: error.status,
        message: error.message,
        data: null,
      };
      return;
    }

    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: "Internal Server Error",
      data: null,
    };
  }
}
