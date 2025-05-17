import { Publisher, Subjects, TicketUpdatedEvent } from '@rallycoding/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
