# Sets

    1. Un-ordered

    2. Stores uniuqe values

    3. Provides standard math operations like 
        Intersection, difference, union

    4. Can be user to check the existence of members

    5. Max number of elements around 4 billions

## Add member 

    sadd cars toyota maserati ford

    sadd cars ferrari

## Total numbers of elements 

    scard cars - number 

    smemebers cars - list of memebers

## Sets maintenance

    sremm cars ford - removes element from set

    spop cars - removes a random element

    srandmember key [count] - gets random count of elements from set    

## Check a membership existence

    sismember cars toyota - check if toyota is part of cars

## Moving elements from one set to another
    
    smove carsFrom carsTo toyota - move toyota from one set to another

## Union operation 

    sunion carsFrom carsTo - union of two sets

    sunionstore destination carsFrom carsTo - union two sets and store to destination

## Intersection operation

    sinter carsFrom carsTo - get all common elements between two sets

## Difference operation

    sdiff carsFrom carsTo - get all different elements between two sets
