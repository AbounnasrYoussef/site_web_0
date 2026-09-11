up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up -d --build 

reset:
	docker compose down -v
	@make up
	@until docker compose exec -T db pg_isready -U admin; do sleep 1; done
	@make populate

destroy:
	@make down
	docker rm -f $(docker ps -aq) 2>/dev/null; docker system prune -a --volumes -f

psql:
	docker compose exec db psql -U admin -d tawjih