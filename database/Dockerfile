FROM postgres:16-alpine

COPY migrations/ /docker-entrypoint-initdb.d/

COPY seeds/30_seed_repo.sql seeds/32_seed_universities_programs.sql /docker-entrypoint-initdb.d/