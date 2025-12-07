import {
    CallHandler,
    ExecutionContext,
    HttpException,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { errorResponse } from '../response/errorResponse';
import { AppError } from '../exceptions/app-error';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((error) => {
                // If response already formatted → return as-is
                if (
                    error &&
                    typeof error === 'object' &&
                    'success' in error &&
                    'message' in error &&
                    'statusCode' in error &&
                    'data' in error
                ) {
                    // don't re-format
                    return of(error);
                }

                // If skipFormatting flag is present → return raw response
                if (error?.skipFormatting) {
                    return of(error);
                }

                // Otherwise apply sendResponse formatting
                let statusCode = 500;
                let message: string | string[] = 'Something went wrong';

                if (error instanceof AppError) {
                    statusCode = error.statusCode;
                    message = error.message;
                } else if (error instanceof HttpException) {
                    statusCode = error.getStatus();
                    const response = error.getResponse();
                    message =
                        typeof response === 'string'
                            ? response
                            : (response as any).message || message;
                }

                return throwError(() =>
                    errorResponse(message, statusCode, error.stack),
                );
            }),
        );
    }
}
