
// General error type from openapi-fetch / react-query
export interface ApiError<TCode = string> extends Error {
    data?: {
        code: TCode;
        message?: string;
    };
    status?: number;
  }
