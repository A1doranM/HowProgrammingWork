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

    1. Key must be UNIQUE
    2. NEVER changes
    3. NEVER NULL
        
#### Super Key 

    It`s any number of columns which forces the row to be unique. E.g. ID, email.

#### Candidate Key 
    
    It`s the least number of columns needed the row to be unique.

### Primary Key

    Key which will be used by another tables for reference to this table. Table
    can have only one PK.

### Foreign Key

    Key which references to PK in another table

    FOREIGN KEY CONSTRAINTS:
        1. ON DELETE (RESTRICT, CASCADE, SET NULL) - what to do with children when PK will be deleted.
        2. ON UPDATE (RESTRICT, CASCADE, SET NULL) - what to do with children when PK will be updated. 

### Alternate Key

### Surrogate Key

    It`s key which we added to database, and they are don`t exist in our data from beginning.
    In most cases this key should be private. 
    E.g. we add ID for each user in Users table to identify users.  

### Natural Key

     Natural key - is the key which is already in table data. 
     E.g. we have table User    with first_name, last_name, email. And we identify 
     user by email, so ligicaly email is a key.

### Simple, Composite, Compound Keys

    Simple - key consist from one columns.
    Composite - key consist from multiple columns.
    Compound - key which consists from multiple columns where each column is a key itself.

### Look up tables

    It`s about avoid same data duplication. 
    
    E.g. we have table Members, and each member have some status so instead of 
    duplicating status every time when user add, we create table Statuses and 
    save status names there, and when we add user to Members table we just assign
    key from Statuses to Member field.

![img_4.png](img_4.png)
![img_5.png](img_5.png)

## 8. Entity Relationship Model (ER diagram)

    Its a way to define relationship model in database, each table we draw as 
    square. 
    E.g. lets define table Users. First column it is ID, second is name, then 
    password.
![img_6.png](img_6.png)
    
## Cardinality
    
    Meanst that thing, or group of things or events compare with other groups
    by containing more, fewer, or same number of instances. In databases, 
    cardinality refers to the relationships between the data in two database 
    tables.

-One to One
![img_9.png](img_9.png)

-One to Many
![img_7.png](img_7.png)  

E.g lets draw one cardholder can have many cards
![img_8.png](img_8.png)

## Modality

    Is about whether or not the relationship is required, we talk about that 
    when we talk about the column characteritic NOT NULL.

    E.g we have Cardholder and Card. And Card must always have Cardholder.
    So Cardholder must always have ID, or another column as PK and Card must 
    always have some Foreign Key which refers to Cardholder, so this field must
    not be NULL. 
    But if we change this requirement to Card should not always have Cardholder, 
    in such case Cardholder field in Card can be NULL. 

In ER diagram

One to One, required
![img_9.png](img_9.png)
![img_12.png](img_12.png)

One to One, not required
![img_11.png](img_11.png)

One to Many, not required and required
![img_13.png](img_13.png)

All together
![img_14.png](img_14.png)
![img_15.png](img_15.png)

## Cardinality and Modality together

![img_16.png](img_16.png)




