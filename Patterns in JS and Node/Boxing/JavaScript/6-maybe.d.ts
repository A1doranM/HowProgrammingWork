export declare class Maybe<T = unknown> {
  constructor(value?: T);

  get value(): T | undefined;

  isEmpty(): boolean;

  match<R>(
    someFn: (value: T) => R,
    noneFn: () => R
  ): R;
}
