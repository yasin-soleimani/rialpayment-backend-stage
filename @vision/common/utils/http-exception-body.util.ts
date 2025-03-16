export const createHttpExceptionBody = (
  message: any,
  success: boolean | String,
  status: number,
) => (message ? { status, success, message } : { status, success });
