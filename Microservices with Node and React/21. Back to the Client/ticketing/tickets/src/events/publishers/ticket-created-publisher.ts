import { Publisher, Subjects, TicketCreatedEvent } from '@rallycoding/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
