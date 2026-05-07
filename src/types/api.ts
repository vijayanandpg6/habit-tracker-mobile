export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown;
  statusCode?: number;
}
