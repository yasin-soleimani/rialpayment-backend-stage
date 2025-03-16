import { MiddlewareConsumer } from '@vision/common/interfaces/middleware/middleware-consumer.interface';

export interface VisionModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void;
}
