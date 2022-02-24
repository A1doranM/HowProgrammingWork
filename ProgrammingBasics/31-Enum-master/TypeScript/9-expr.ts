enum FileAccess {
  Read = 1,                // 0b01
  Write,                   // 0b10
  ReadWrite = Read + Write // 0b11
}

const value1 = FileAccess.Read;
const value2 = FileAccess.Write;
const value3 = FileAccess.ReadWrite;

console.dir({ value1, value2, value3 });
