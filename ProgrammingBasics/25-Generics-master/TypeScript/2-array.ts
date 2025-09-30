function reverse<T>(array: T[]): T[] {
  const res = [];
  for (const item of array) res.unshift(item);
  return res;
}

const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
console.log(reverse(arr));

const list: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
console.log(reverse(list));
