# Redis Protocol

RESP - Redis Serialization Protocol

In RESP, the type of some data depends on first byte

    For Simple String the first byte of the reply is "+"
    For Errors the first byte of the reply is "-"
    For Integers the first byte of the reply is ":"
    For Bulk Strings the first byte of the reply is "$"
    For Arrays the first byte of the reply is "*"

## Generating Redis Protocol

