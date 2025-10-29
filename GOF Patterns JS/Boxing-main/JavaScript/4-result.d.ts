export type VariantClass = {
  new (value: unknown): object;
  is(value: unknown): boolean;
};

export type VariantShape = Record<string, VariantClass>;

export type SumStruct<Variants extends VariantShape> = {
  new (value: unknown): InstanceType<Variants[keyof Variants]>;
  create(value: unknown): InstanceType<Variants[keyof Variants]>;
  readonly tag: string;
  readonly variants: (keyof Variants)[];
};

export declare class Sum {
  static create<
    Tag extends string,
    Variants extends VariantShape
  >(
    shape: Record<Tag, Variants>
  ): SumStruct<Variants>;
}
