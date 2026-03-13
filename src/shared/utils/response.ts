import type { ApiResponse } from "../types/api";

export function success<T>(data: T, message = "OK"): ApiResponse<T> {
  return {
    code: 0,
    message,
    data,
  };
}
