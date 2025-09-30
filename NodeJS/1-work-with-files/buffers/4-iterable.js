const buffer = Buffer.from("Test str");

for (const char of buffer.values()) {
    console.log({char});
}

for (const entry of buffer.entries()) {
    console.log({entry});
}