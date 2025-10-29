export interface TupleStruct<T extends readonly unknown[]> {
  readonly size: number;
  create(...args: T): Readonly<T>;
}

export declare class Tuple {
  static create<T extends readonly unknown[]>(
    ...values: T
  ): TupleStruct<T>;
}
