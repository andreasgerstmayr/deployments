default: run

build:
	docker build -t tracegen-java .

run: build
	docker run --network=host tracegen-java
