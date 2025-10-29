export declare class Sum {
  static create<
    Tag extends string,
    Variants extends Record<string, VariantClass>
  >(
    shape: Record<Tag, Variants>
  ): SumStruct<Variants>;
}

export interface VariantClass {
  new (value: unknown): unknown;
  is(value: unknown): boolean;
}

export type SumStruct<Variants extends Record<string, VariantClass>> = {
  create(value?: unknown): InstanceType<Variants[keyof Variants]>;
  readonly tag: string;
  readonly variants: (keyof Variants)[];
};
