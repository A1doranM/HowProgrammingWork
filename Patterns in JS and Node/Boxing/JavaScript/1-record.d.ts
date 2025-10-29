export type RecordInstance<T extends readonly string[]> = {
  [K in T[number]]: unknown;
};

export interface RecordStruct<T extends readonly string[]> {
  readonly fields: T;
  readonly mutable: boolean;
  create(...args: unknown[]): RecordInstance<T>;
}

export declare class Record {
  static immutable<T extends readonly string[]>(
    fields: T
  ): RecordStruct<T>;

  static mutable<T extends readonly string[]>(
    fields: T
  ): RecordStruct<T>;

  static update<T extends object>(
    instance: T,
    updates: Partial<T>
  ): T;

  static fork<T extends object>(
    instance: T,
    updates: Partial<T>
  ): T;
}
