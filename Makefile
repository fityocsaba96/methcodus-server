all: build install start
build:
	docker-compose build
install:
	docker-compose run --rm server npm install
start:
	docker-compose up --no-build
stop:
	docker-compose stop
destroy:
	docker-compose down
npm:
	docker-compose exec server npm run $(script)
ssh:
	docker-compose exec $(service) bash
