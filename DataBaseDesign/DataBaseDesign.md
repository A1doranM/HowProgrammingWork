# Database Design

## Database schemas
    1. Conceptual (think about data overall)
    
    2. Logical  (specify tables, types, relations)

    3. Physical (choose server, provider, amount of memory)

## 1. Data integrity
    Integrity problems (prevent duplicates, keep data updated, e.t.c.)

### Types of Data Integrity

    1. Entity integrity 

    Each entity are unique. E.g. (we do not have two equals IDs in table)

    2. Referential integrity

    It is about reference from one table to another. E.g. Comments table refers to Users table
    because each comment must have user who sent it.

    3. Domain integrity

    It is about what we are storing and how we storing it. 
    E.g. phone number should have country code, then 7 - 9 digits.


## 2. Atomic values
    Basicaly means that value stores, changes, deletes as one thing.
    
## 3. Relationships
    1. One to One
    2. Many to One
    3. Many to Many

## 4. Design One to One relationship
    E.g we have account and user in tabke username exclusive for each user
![img.png](img.png)

    E.g. cardholder  and card.
![img_1.png](img_1.png)

## 5. Design One to Many relationship
    E.g. user can has many cards but the card can belongs to only one user.
    For this we just remove cardId from User table and add userId to card table.
![img_2.png](img_2.png)

## 6. Parent and Child tables

    Parent has Primary key (PK)
    Child has Foreign key (FK)

    E.g. comments on YouTube, User - Parent, Comments - Child, because
    Comments table refers to User with FK, Parent inherits nothing from child (we do not refer from user to each comment).
    But child "inherits" Foreign Key from Parent (each comment have one User who wrote it).
![img_3.png](img_3.png)

## 7. Keys

    1. Natural key - is the key which is already in table data. E.g. we have table User
       with first_name, last_name, email. And we identify user by email, so ligicaly email 
       is a key.

### Look up tables

    It`s about avoid same data duplication. 
    
    E.g. we have table Members, and each member have some status so instead of 
    duplicating status every time when user add, we create table Statuses and 
    save status names there, and when we add user to Members table we just assign
    key from Statuses to Member field.

![img_4.png](img_4.png)
![img_5.png](img_5.png)

