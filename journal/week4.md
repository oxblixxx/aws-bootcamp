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
cd into the schema directory backend-flask/bin, update the schema.sql with an editor with tables of activities and user. 

```sql
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.activities;
```
```sql
CREATE TABLE public.users (
  uuid UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  display_name text,
  handle text,
  cognito_user_id text,
  created_at TIMESTAMP default current_timestamp NOT NULL
);
```
```sql
CREATE TABLE public.activities (
  uuid UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_uuid UUID NOT NULL,
  message text NOT NULL,
  replies_count integer DEFAULT 0,
  reposts_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  reply_to_activity_uuid integer,
  expires_at TIMESTAMP,
  created_at TIMESTAMP default current_timestamp NOT NULL
);
```

in the current directory create a seed file then cd into backend-flask/db, create a script to run to load the seed file as well, ensure to change the file permssion as well

```sql
-- this file was manually created
INSERT INTO public.users (display_name, handle, cognito_user_id)
VALUES
  ('Andrew Brown', 'andrewbrown' ,'MOCK'),
  ('Andrew Bayko', 'bayko' ,'MOCK');

INSERT INTO public.activities (user_uuid, message, expires_at)
VALUES
  (
    (SELECT uuid from public.users WHERE users.handle = 'andrewbrown' LIMIT 1),
    'This was imported as seed data!',
    current_timestamp + interval '10 day'
  )
```

```sh
#! /usr/bin/bash 

seed_path="$(realpath ..)/db/seed.sql"

echo $seed_path

echo "db-seed"

if [ "$1" == "production" ]; then
    echo "using production db"
    URL=$PROD_CONNECTION_URL
else 
    echo "using in development db"
    URL=$CONNECTION_URL
fi

$CONNECTION_URL cruddur < $seed_path
```

You can as well run a a script to compile the db-load, db-seed in a script as well, cd into backend-flask/bin create a file db-load and put in the below command in there

```sh
#! /usr/bin/bash

-e # stop if it fails at any point

#echo "==== db-setup"

bin_path="$(realpath ..)/bin"

source "$bin_path/db-drop"
source "$bin_path/db-create"
source "$bin_path/db-schema-load"
source "$bin_path/db-seed"
```

to view actice sessions connected to db, create a file in the backend-flask/bin and open a db-session
```sh
#! /usr/bin/bash

if [ "$1" == "prod" ]; then
    echo "using production db"
    URL=$PROD_CONNECTION_URL
else 
    echo "using in development db"
    URL=$CONNECTION_URL
fi


NO_URL=$(sed 's/\/cruddur//g' <<<"$URL")
$NO_URL -c "select pid as process_id, \
       usename as user,  \
       datname as db, \
       client_addr, \
       application_name as app,\
       state \
from pg_stat_activity;"
```

update requirements.txt to install for postgres client, update the docker-compose.yaml to set the env for the postgres login. Run pip install -r requirements.txt.

```yaml
  backend-flask:
    environment:
      CONNECTION_URL:  "postgresql://postgres:password@db:5432/cruddur" 
```

here is the link to the docs  [https://www.psycopg.org/psycopg3/](https://www.psycopg.org/psycopg3/)
```txt
psycopg[binary]
psycopg[pool]
```

for the Db object and connection opem backend-flask/lib/db.py

```py
from psycopg_pool import ConnectionPool
import os

def query_wrap_object(template):
  sql = f"""
  (SELECT COALESCE(row_to_json(object_row),'{{}}'::json) FROM (
  {template}
  ) object_row);
  """
  return sql

def query_wrap_array(template):
  sql = f"""
  (SELECT COALESCE(array_to_json(array_agg(row_to_json(array_row))),'[]'::json) FROM (
  {template}
  ) array_row);
  """
  return sql

connection_url = os.getenv("CONNECTION_URL")
pool = ConnectionPool(connection_url)
```

update services/home_activities.py with the api call

```py
sql = query_wrap_array("""
      SELECT
        activities.uuid,
        users.display_name,
        users.handle,
        activities.message,
        activities.replies_count,
        activities.reposts_count,
        activities.likes_count,
        activities.reply_to_activity_uuid,
        activities.expires_at,
        activities.created_at
      FROM public.activities
      LEFT JOIN public.users ON users.uuid = activities.user_uuid
      ORDER BY activities.created_at DESC
    """)
    print("SQL--------------")
    print(sql)
    print("SQL--------------")
    with pool.connection() as conn:
      with conn.cursor() as cur:
        cur.execute(sql)
        # this will return a tuple
        # the first field being the data
        json = cur.fetchone()
    print("-1----")
    print(json[0])
    return json[0]
    return results
```

# CONNECT TO DB
to connect to db we need to allow inbound rule from gitpod IP address. Run the command 

```sh
echo GITPOD_IP=$(curl ifconfig.me)
```
to automatically update the gitpod IP on relaunch, login to your console, fetch the security group ID and security rule group ID attached to the RDS. Then set the env variables. Description should be set as GITPOD

```sh
export DB_SG_ID="sg-08895646d8830b0eb"
gp env DB_SG_ID="sg-08895646d8830b0eb"
export DB_SG_RULE_ID="sgr-0eab2429a165ea98c"
gp env DB_SG_RULE_ID="sgr-0eab2429a165ea98c"
```

```sh
aws ec2 modify-security-group-rules \
    --group-id $DB_SG_ID \
    --security-group-rules "SecurityGroupRuleId=$DB_SG_RULE_ID,SecurityGroupRule={Description=GITPOD,IpProtocol=tcp,FromPort=5432,ToPort=5432,CidrIpv4=$GITPOD_IP/32}"
```

on relaunch, to set gitpod to automatticaly update the sg, add the below code
```sh
    command: |
      export GITPOD_IP=$(curl ifconfig.me)
      source "$THEIA_WORKSPACE_ROOT/backend-flask/rds-update-sg-rule"
```
---
# Create a Lamda function for Cognito Confirmation 
login to aws console, create a lamda function with python version 3.8

here is the code to deploy
```py
import json
import psycopg2
import os

def lambda_handler(event, context):
    user = event['request']['userAttributes']
    print('userAttributes')
    print(user)

    user_display_name  = user['name']
    user_email         = user['email']
    user_handle        = user['preferred_username']
    user_cognito_id    = user['sub']
    try:
      print('entered-try')
      sql = f"""
         INSERT INTO public.users (
          display_name, 
          email,
          handle, 
          cognito_user_id
          ) 
        VALUES(%s,%s,%s,%s)
      """
      print('SQL Statement ----')
      print(sql)
      conn = psycopg2.connect(os.getenv('CONNECTION_URL'))
      cur = conn.cursor()
      params = [
        user_display_name,
        user_email,
        user_handle,
        user_cognito_id
      ]
      cur.execute(sql,*params)
      conn.commit() 

    except (Exception, psycopg2.DatabaseError) as error:
      print(error)
    finally:
      if conn is not None:
          cur.close()
          conn.close()
          print('Database connection closed.')
    return event
```
then add a new layer, specify ARN. We are using a library names pyscopg -- here is a link to the documentation ![psycopg](https://github.com/jetbridge/psycopg2-lambda-layer). Choose the one specific to your location and version. 

proceed to cognito to apply the lamda triggers under user pool properties, choose post confirmation, the previously created lamda, then create lamda.


