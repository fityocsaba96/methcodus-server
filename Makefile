all: build install start
build:
	docker-compose build
install:
	docker-compose run --rm api npm install
start:
	docker-compose up --no-build
stop:
	docker-compose stop
destroy:
	docker-compose down
npm:
	docker-compose exec api npm run $(script)
ssh:
	docker-compose exec $(service) bash
