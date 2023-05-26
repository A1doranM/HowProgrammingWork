# Designing Databases in Redis

    1. Don`t be afraid to generate lots of key-value pairs
    2. Feel free to store each row of the table in a different key
    3. Use Redis' hash map data type
    4. Form key name from primary key values of the table by a separator (such as ":")
    5. Store the remaining fields as a hash

## Query data

    1. When you want ti query a single row, directly from the key and retrieve its
        results.
    2. When you want to query a range, use wild char "*" towards you key.

E.g Store table result in Redis

CREATE TABLE public.order_details

    (
        order_id smallint NOT NULL,
        product_id smallint NOT NULL,
        unit_price real NOT NULL,
        quantity smallint NOT NULL,
        discount real NOT NULL,
        CONSTRAINT pk_order_details PRIMARY KEY (order_id, product_id)
    );

Now imagine that we queried some data from this table and want to store it to Redis
One of the best data structure for it is SET.

Returned data looks like: 

    order_id | product_id | unit_price | quantity | discount
       10248 |         11 |         14 |       12 |        0
       10248 |         42 |        9.8 |       10 |        0

Save data to Redis

    hmset order:product:10248:11 unit_price 14 quantity 12 discount 0

    hmset order:product:10248:42 unit_price 9.8 quantity 10 discount 0

Get data about a particular product in order

    hgetall order:product:10248:11

Get data about overall order

    keys order:product:10248:* 

Get data about a particular product in all orders

    keys order:product:*:11 
