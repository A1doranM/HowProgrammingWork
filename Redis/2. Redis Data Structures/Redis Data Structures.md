# Redis Data Types and Structures

## Strings 

    - Binary save, so can store any data type 
    - Any type of data can be serialized to String
    - Can behave aas random access vector too
    - Max size - 512 MB

### Plain Strings

    - Serving static contents like static website pages
    
### Caching 

    - Frequently used data can be cached into string
    - With the help of "expiry", "set" commands caching can be possible

