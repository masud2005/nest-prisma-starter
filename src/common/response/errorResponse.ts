export const errorResponse = (
  message: string | string[],
  statusCode: number,
  errors?: any,
) => {
  return {
    success: false,
    message,
    statusCode,
    errors: errors ?? null,
    data: null,
  };
};
