# Publish/Subscribe

    1. Allows to create simple message busses
    2. Its allows to 
        - PUBLISH messages to channels
        - and SUBSCRIBE to messages from channels
    3. It`s fire and forget messages
    4. Redis acts as a 'central broker' for multiple clients providing
        - Simple method to post messages
        - and consume messages

## Subscribe to channel
    
    subscribe ch1

## Publish to channel

    publish ch1 msg1

## Manage channels and subscriptions

    pubsub channels *  -  returns list of channels

    pubsub channels news:*  -  all channels with news: and something after ":"

    pubsub numsub news  -  number of subscriptions to channel news:*
