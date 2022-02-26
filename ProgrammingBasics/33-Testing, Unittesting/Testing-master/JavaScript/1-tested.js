"use strict";

const assert = require("assert").strict;

// Convert IP string to number
//   ip <string> - IP address
// Returns: <number>
const ipToInt = ip => ip.split(".")
  .reduce((res, item) => (res << 8) + +item, 0);

// Tests

{
  const n = ipToInt("127.0.0.1");
  // ["127", "0", "0", "1"]
  // 0 << 8 = 0
  // 0 + 127 = 127
  // 127 << 8 = 32512
  // 32512 + 0 = 32512
  // 32512 << 8 = 8323072
  // 8323072 + 0 = 8323072
  // 8323072 << 8 = 2130706432
  // 2130706432 + 1 = 2130706433
  // 1111111000000000000000000000001
  assert.strictEqual(n, 2130706433, "Localhost IP address");
}

{
  const n = ipToInt("10.0.0.1");
  assert.strictEqual(n, 167772161, "Single class A network");
}

{
  const n = ipToInt("192.168.1.10");
  assert.strictEqual(n, -1062731510, "Negative number");
}

{
  const n = ipToInt("0.0.0.0");
  assert.strictEqual(n, 0, "Four zeros");
}

{
  const n = ipToInt("wrong-string");
  assert.strictEqual(n, Number.NaN, "Wrong string");
}

{
  const n = ipToInt("");
  assert.strictEqual(n, 0, "Empty string");
}

{
  const n = ipToInt("8.8.8.8");
  assert.strictEqual(n, 0x08080808, "Four eights");
}
