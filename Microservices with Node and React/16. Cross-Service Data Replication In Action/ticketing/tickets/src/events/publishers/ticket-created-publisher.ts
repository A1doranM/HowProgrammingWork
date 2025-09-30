import { Publisher, Subjects, TicketCreatedEvent } from '@rallycoding/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
