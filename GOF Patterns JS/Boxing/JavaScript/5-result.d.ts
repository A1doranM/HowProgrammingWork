export declare class Result<T = unknown, E = Error> {
  readonly value?: T;
  readonly error?: E;

  constructor(params: { value?: T; error?: E });

  static create<T, E = Error>(input: T | E): Result<T, E>;
  static fromValue<T>(value: T): Result<T, never>;
  static fromError<E>(error: E): Result<never, E>;

  isSuccess(): boolean;
  isError(): boolean;
}
