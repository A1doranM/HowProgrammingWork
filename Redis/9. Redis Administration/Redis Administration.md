# Redis Administration

## Inspect internal Redis objects 

    use "object [command] key"

    refcount - number of references of the value associated with the key

    encoding - kind of internal representation used to store the value associated with 
                key

    idletime - number of seconds since the object stored at the specified key

    freq - returns the logarithmic access frequency counter of the object stored at 
            the specified key

## Dump and Restore Keys 

    dump keyName - returns how key stored in data

    restore keyName - restore key from internal Redis format to his original. 

    e.g get data throught dump and pass this value to restore

## Check command history

    Search for file named ".rediscli_history"

## Scan keys 

    redis-cli --scan --pattern '*name:*' - returns all keys matched this pattern
