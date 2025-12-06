import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { sendResponse } from '../response/sendResponse';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();

        return next.handle().pipe(
            map((res) => {
                // If response already formatted → return as-is
                if (
                    res &&
                    typeof res === 'object' &&
                    'success' in res &&
                    'message' in res &&
                    'statusCode' in res &&
                    'data' in res
                ) {
                    // don't re-format
                    return res;
                }

                // If skipFormatting flag is present → return raw response
                if (res?.skipFormatting) return res;

                // Otherwise apply sendResponse formatting
                return sendResponse(res?.data ?? res, {
                    message: res?.message,
                    statusCode: res?.statusCode ?? response.statusCode,
                    pagination: res?.pagination,
                });
            }),
        );
    }
}
