import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@rallycoding/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
