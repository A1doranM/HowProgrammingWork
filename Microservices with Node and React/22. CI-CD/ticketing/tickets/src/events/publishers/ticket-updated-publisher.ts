import { Publisher, Subjects, TicketUpdatedEvent } from '@rallycoding/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
