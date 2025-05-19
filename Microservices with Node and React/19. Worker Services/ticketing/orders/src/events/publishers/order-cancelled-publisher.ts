import { Subjects, Publisher, OrderCancelledEvent } from '@rallycoding/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
