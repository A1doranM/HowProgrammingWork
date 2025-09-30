INSERT INTO "Identifier" DEFAULT VALUES;
INSERT INTO "Account" ("id", "login", "password")
VALUES (lastval(), "admin", "ypMEd9FwvtlOjcvH94iICQ==:V6LnSOVwXzENxeLCJk59Toadea7oaA1IxYulAOtKkL9tBxjEPOw085vYalEdLDoe8xbrXQlhh7QRGzrSe8Bthw==");

INSERT INTO "Identifier" DEFAULT VALUES;
INSERT INTO "Account" ("id", "login", "password")
VALUES (lastval(), "aldoran", "dpHw0OUNBz76nuqrXZbeYQ==:wpvUVgi8Yp9rJ0yZyBWecaWP2EL/ahpxZY74KOVfhAYbAZSq6mWqjsQwtCvIPcSKZqUVpVb13JcSciB2fA+6Tg==");

INSERT INTO "Identifier" DEFAULT VALUES;
INSERT INTO "Account" ("id", "login", "password")
VALUES (lastval(), "test_user_1", "r8zb8AdrlPSh5wNy6hqOxg==:HyO5rvOFLtwzU+OZ9qFi3ADXlVccDJWGSfUS8mVq43spJ6sxyliUdW3i53hOPdkFAtDn3EAQMttOlIoJap1lTQ==");

INSERT INTO "Identifier" DEFAULT VALUES;
INSERT INTO "Account" ("id", "login", "password")
VALUES (lastval(), "test_user_2", "aqX1O4bKXiwC/Jh2EKNIYw==:bpE4TARNg09vb2Libn1c00YRxcvoklB9zVSbD733LwQQFUuAm7WHP85PbZXwEbbeOVPIFHgflR4cvEmvYkr76g==");

-- Examples login/password
-- admin/123456
-- aldoran/marcus
-- test_user_1/nopassword
-- test_user_2/zulqarnayn

INSERT INTO "Area" ("name", "ownerId") VALUES
  ("Metarhia", (SELECT "id" FROM "Account" WHERE "login" = "aldoran")),
  ("Metaeducation", (SELECT "id" FROM "Account" WHERE "login" = "aldoran"));

INSERT INTO "AreaAccount" ("areaId", "accountId") VALUES
  ((SELECT "areaId" FROM "Area" WHERE "name" = "Metarhia"), (SELECT "id" FROM "Account" WHERE "login" = "admin")),
  ((SELECT "areaId" FROM "Area" WHERE "name" = "Metarhia"), (SELECT "id" FROM "Account" WHERE "login" = "aldoran")),
  ((SELECT "areaId" FROM "Area" WHERE "name" = "Metarhia"), (SELECT "id" FROM "Account" WHERE "login" = "test_user_1")),
  ((SELECT "areaId" FROM "Area" WHERE "name" = "Metarhia"), (SELECT "id" FROM "Account" WHERE "login" = "test_user_2")),
  ((SELECT "areaId" FROM "Area" WHERE "name" = "Metaeducation"), (SELECT "id" FROM "Account" WHERE "login" = "admin")),
  ((SELECT "areaId" FROM "Area" WHERE "name" = "Metaeducation"), (SELECT "id" FROM "Account" WHERE "login" = "aldoran")),
  ((SELECT "areaId" FROM "Area" WHERE "name" = "Metaeducation"), (SELECT "id" FROM "Account" WHERE "login" = "test_user_1")),
  ((SELECT "areaId" FROM "Area" WHERE "name" = "Metaeducation"), (SELECT "id" FROM "Account" WHERE "login" = "test_user_2")),
