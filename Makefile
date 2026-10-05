up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up -d --build 

reset:
	docker compose down -v
	@make build
	@until docker compose exec -T db pg_isready -U admin; do sleep 1; done

destroy:
	@make down
	docker rm -f $(docker ps -aq) 2>/dev/null; docker system prune -a --volumes -f

psql:
	docker compose exec db psql -U admin -d tawjih

#---------------------moel-oua-----------------------
.PHONY: moel-oua-install moel-oua
moel-oua-install:
	pip install -r moel-oua/backend/requirements.txt

moel-oua:
	cd moel-oua/backend && gunicorn --bind 0.0.0.0:5001 --reload app:app
