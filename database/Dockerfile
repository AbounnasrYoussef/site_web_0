FROM postgres:16-alpine

COPY migrations/ /docker-entrypoint-initdb.d/

COPY seeds/30_seed_repo.sql seeds/31_seed_testdb.sql /docker-entrypoint-initdb.d/