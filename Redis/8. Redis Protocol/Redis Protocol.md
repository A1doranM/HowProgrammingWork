# Redis Protocol

RESP - Redis Serialization Protocol

In RESP, the type of some data depends on first byte

    For Simple String the first byte of the reply is "+"
    For Errors the first byte of the reply is "-"
    For Integers the first byte of the reply is ":"
    For Bulk Strings the first byte of the reply is "$"
    For Arrays the first byte of the reply is "*"

## Generating Redis Protocol

    *<args><cr><lf><lf>
    $<len><cr><lf>

e.g. Turn this command to Redis Protocol "SET name Redis"

    *3<cr><lf><lf>               *3 arguments: SET name Redis
    $3<cr><lf>                   $3 characters: SET
    SET<cr><lf>
    $4<cr><lf>                   $3 characters: name
    name<cr><lf>
    $5<cr><lf>                   $5 characters: Redis
    Redis<cr><lf>

All together

    *3<cr><lf><lf>$3<cr><lf>SET<cr><lf>$4<cr><lf>name<cr><lf>$5<cr><lf>Redis<cr><lf>
