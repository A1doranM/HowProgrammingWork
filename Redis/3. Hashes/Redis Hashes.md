# Hashes

Hashes are list of fields and values pairs

They are similar to JSON objects

Represents mapping relationships between fields and values

Hashes are schemaless

## Use cases 

    1. Storing object properties: Name, Location

    2. Schemaless situations when we do not have  auniform data structure or 
        fixed fields values i.e. with hash you can create any field value 
        without worrying about schema e.g. "user_not_to_called":"Y"

## HSET, HGET, HGETALL 

    HSET - set hash value. hset user fname "John" lname "Doe"

    HGET - get particular field. hget user fname
    
    HGETALL - get all fields and values. hgetall user

## Get multiple fields values via HMGET

    hmget user fname lname

## Another usefull commands

    HLEN - length of hash.

    HDEL - delete field

    HEXISTS - check if a field exist

    HKEYS - get all fields name 

    HVALS - get all fields values 

    HSETNX - safe adding field

    HRANDFIELD - get random field

## Counting

    HINCRBY - for int

    HINCRBYFLOAT - for float

