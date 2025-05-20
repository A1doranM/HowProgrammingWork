import { Subjects, Publisher, PaymentCreatedEvent } from '@rallycoding/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
