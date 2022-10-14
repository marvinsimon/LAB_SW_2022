#!/usr/bin/env sh
sql=$(cat create_tables.sql)
docker run -d -p 5432:5432 --name royal-db -e POSTGRES_PASSWORD=clickerroyale -e POSTGRES_USER=admin postgres:14.5-alpine postgres
sleep 5
docker exec -it royal-db psql -U admin -c "$sql"