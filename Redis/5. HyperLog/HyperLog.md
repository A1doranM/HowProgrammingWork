# HyperLog

    1. HyperLogLog is a probabilistic data structure
    2. Used in order to count unique things
    3. Encoded as a Redis string
    4. Conceptually the HLL is like using Sets to do 
        the same task
    5. They are not one hundred percent accurate
    6. By using HLL we ca save a tremendous amount of memory
    7. Allows you yo maintain counts of millions of items
    8. The main purpose of HLL is to tell the approx number of estimates of 
        unique items.
    9. Its uses far less disk space then ordinary sets
    10. Keeps a counter of items that is incremented
    11. It does not store the data, but only the cardinality (count)
    12. We can not see data stored in HyperLogLog

## Create and Add data to HyperLogLog

    pfadd hll1 1 2 3 4

    add new data

    pfadd hll1 5

## Total cardinality, or count of elements

    pfcount hll1

## Merge different hll`s

    pfmerge hllResult hll1 hll2
