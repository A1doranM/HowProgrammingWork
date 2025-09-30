import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

// Store and retrieve simple string

await client.set("key", "value");

const value = await client.get("key");

// Store and retrieve Map
// hset user-session:123 {"name": "John", "company": "Redis", "age": 29}

await client.hSet("user-session:123", {
  name: "John",
  company: "Redis",
  age: 29,
});

let userSession = await client.hGetAll("user-session:123");
console.log(JSON.stringify(userSession, null, 2));
