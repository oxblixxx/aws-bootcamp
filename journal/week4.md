# Week 4 — Postgres and RDS

## Creating a postgres database usin the CLI

In the prior week, we included Postgresql database image in our docker-compose.yml and in the gitpod.yml, there is the task to install postgresql. 

configure aws credentials then open the terminal, copy and and paste the below code, stopping the database on AWS console ensentially stops it for 7days of which it starts automatically.

```sql
aws rds create-db-instance \
  --db-instance-identifier cruddur-db-instance \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version  14.6 \
  --master-username oxblixxx \
  --master-user-password wearewinning \
  --allocated-storage 20 \
  --availability-zone us-east-1a \
  --backup-retention-period 0 \
  --port 5432 \
  --no-multi-az \
  --db-name cruddur \
  --storage-type gp2 \
  --publicly-accessible \
  --storage-encrypted \
  --enable-performance-insights \
  --performance-insights-retention-period 7 \
  --no-deletion-protection
```
Check the docker logs to see if postgresql is running. That's a must! Run the command below to login into the local db and the password is "password" as the name implies :)

```sql
psql -Upostgres --host localhost
```

this are commands to run while logged into the db and there is more

```sql
\x on -- expanded display when looking at data
\q -- Quit PSQL
\l -- List all databases
\c database_name -- Connect to a specific database
\dt -- List all tables in the current database
\d table_name -- Describe a specific table
\du -- List all users and their roles
\dn -- List all schemas in the current database
CREATE DATABASE database_name; -- Create a new database
DROP DATABASE database_name; -- Delete a database
CREATE TABLE table_name (column1 datatype1, column2 datatype2, ...); -- Create a new table
DROP TABLE table_name; -- Delete a table
SELECT column1, column2, ... FROM table_name WHERE condition; -- Select data from a table
INSERT INTO table_name (column1, column2, ...) VALUES (value1, value2, ...); -- Insert data into a table
UPDATE table_name SET column1 = value1, column2 = value2, ... WHERE condition; -- Update data in a table
DELETE FROM table_name WHERE condition; -- Delete data from a table
```

create a db named cruddur on the local database with
``` sql
create database cruddur;
```

There will be repetition so therefore, scripts needs to be created, cd into the backend flask, create a schema folder and file name create.sql. Copy and paste the code below ::UUID implies universaally unique identifier

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

psql cruddur < db/schema.sql -h localhost -U postgres


set a pasql environment variable to login






