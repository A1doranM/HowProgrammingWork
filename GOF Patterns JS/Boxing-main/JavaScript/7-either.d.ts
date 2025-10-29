export declare class Either<L = unknown, R = unknown> {
  constructor(params: { left?: L | null; right?: R | null });

  static left<L>(value: L): Either<L, null>;

  static right<R>(value: R): Either<null, R>;

  get left(): L | null;

  get right(): R | null;

  isLeft(): boolean;

  isRight(): boolean;

  map<U>(fn: (value: R) => U): Either<L, U>;

  match<T>(
    leftFn: (left: L) => T,
    rightFn: (right: R) => T
  ): T;
}
