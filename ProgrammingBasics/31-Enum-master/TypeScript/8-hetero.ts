enum FileAccess {
  Read = 1, Write,
  ReadWrite = "RW"
}

const value1 = FileAccess.Read;
const value2 = FileAccess.Write;
const value3 = FileAccess.ReadWrite;

console.dir({ value1, value2, value3 });
