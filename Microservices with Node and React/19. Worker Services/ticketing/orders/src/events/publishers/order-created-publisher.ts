import { Publisher, OrderCreatedEvent, Subjects } from '@rallycoding/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
