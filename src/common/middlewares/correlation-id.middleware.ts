import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

const CORRELATION_ID_HEADER = 'X-Correlation-Id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {

  private static asyncLocalStorage = new AsyncLocalStorage<Map<string, string>>();

  use(req: Request, res: Response, next: NextFunction): void {

    const id = (req.headers[CORRELATION_ID_HEADER] as string) || uuidv4();
    const store = new Map();
    store.set(CORRELATION_ID_HEADER, id);

    CorrelationIdMiddleware.asyncLocalStorage.run(store, () => {
      req[CORRELATION_ID_HEADER] = id;
      res.set(CORRELATION_ID_HEADER, id);
      next();
    });
  }

  static getCorrelationId(): string | undefined {
    const store = CorrelationIdMiddleware.asyncLocalStorage.getStore();
    return store ? store.get(CORRELATION_ID_HEADER) : undefined;
  }
}