# Stored Sets

    1. Mix between Set and a Hash 
    2. Are implemented via a dual-ported data structure
        containing both a skip list and a hash table
    3. Adding and retrieving sorted elements extremely fast
    4. Like Hashes sorted sets store
        - multiple fields called "members", and 
        - their numerical values called "scores"
    5. Akk the members are always unique, non repeating strings
    6. They are ordered based on their scores
    7. Used to store data that needs to be ranked, such as leadership and more.
    8. Like a hash a single key stores multiple members.
    9. The score of each memeber is a number.
    10. If we add 2 members with the same name and score only last will be added.

Examples 

Let`s create a following data into a stored sets

    Users           # of folowers

    Adam            10
    Scott           20
    Amy             30 

Adds all the specified members with the specified scores to the sorted
set stored at key.

    zadd users:followers 10 adam 20 scott 30 amy

Get all members from a sorted set

    zrange users:followers 0 -1

Get all members and scores from a sorted set

    zrange users:followers 0 -1 withscores

Display data in reverse score order

    zrevrange users:followers 0 -1

    zrevrange users:followers 0 -1 withscores

Atomic Operations 

    zincrby users:fllowers 5 adam - increment key from 10 to 15

    zincrby users:fllowers -5 adam - decrement key from 15 to 10

    If member does not exists it will be added to a set

    zincrby users:fllowers 5 test - add test with score 5 to set.
