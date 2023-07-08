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

A postgresql extension needs to be applied to generate random numbers for users and allocate to them, Copy and paste the code below in a folder db, then create schema.sql ::UUID implies universaally unique identifier

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
run the schema with the command below, 

```
psql cruddur < db/schema.sql -h localhost -U postgres
```
to avoide passwword prompt, there a various ways to login but we will use the CONNECTION URL METHOD, then create an environment variable for quick access

```
psql postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}
psql "postgresql://postgres:password@localhost:5432/cruddur"
```

create a bin directory, in the bin directory create files without an extension db-create, db-schema-load, db-drop. from anywhere on the terminal run the command 
```sh
whereis bash
```

open db-create with your favourite text editor, paste the below code. Run chmod +x db-create db-schema-load db-drop to make the files executable

```sh
#! /usr/bin/bash 
echo "drop create database"
NO_DB_CONNECTION_URL=$(sed 's/\/cruddur//g' <<<"$CONNECTION_URL")
$NO_DB_CONNECTION_URL -c "CREATE database cruddur;"
```
open db-drop as well, paste the below code

```sh
#! /usr/bin/bash 
echo "drop databse"
NO_DB_CONNECTION_URL=$(sed 's/\/cruddur//g' <<<"$CONNECTION_URL")
$NO_DB_CONNECTION_URL -c "DROP database cruddur;"
```

open db-load-schema as well, paste the below code, in the this file, we are update it with a condition to use production environment and development environment, also to pull the path of the schema.sql file. Meanwhile, the production envirinment needs to be set. Login to the AWS console, open the RDS dashboard, on the previously created db using the AWS CLI. Under connectivity and security copy the endpoint url.

```sh
#! /usr/bin/bash 

schema_path="$(realpath ..)/db/schema.sql"
echo $schema_path
echo "db-schema-load"

if [ "$1" == "production"]; then
    echo "using production db"
    URL=$PROD_CONNECTION_URL
else 
    echo "using in development db"
    URL=$CONNECTION_URL
fi

$CONNECTION_URL cruddur < $schema_path

```


