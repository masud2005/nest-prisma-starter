export const sendResponse = (
  data: any,
  options?: {
    message?: string | string[];
    statusCode?: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  },
) => {
  const message = options?.message ?? 'Request Success';
  const statusCode = options?.statusCode ?? 200;

  return {
    success: statusCode >= 200 && statusCode < 300,
    message,
    statusCode,
    data,
    ...(options?.pagination && {
      metadata: {
        page: options.pagination.page,
        limit: options.pagination.limit,
        total: options.pagination.total,
        totalPage: Math.ceil(
          options.pagination.total / options.pagination.limit,
        ),
      },
    }),
  };
};
