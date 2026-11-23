.PHONY: help install dev dev-docker dev-down build docker-build typecheck lint clean

IMAGE_NAME ?= docker.io/rwang345/jian-bing-liu
IMAGE_TAG ?= local
SITE_URL ?= https://jianbingliu.uk

help:
	@echo "Jian Bing Liu Commands:"
	@echo "  make install      - Install dependencies with pnpm"
	@echo "  make dev          - Start local Next.js development server"
	@echo "  make dev-docker   - Build and run production container via Docker Compose"
	@echo "  make dev-down     - Stop and remove Docker Compose containers"
	@echo "  make build        - Build Next.js standalone production bundle"
	@echo "  make docker-build - Build production Docker image with BuildKit"
	@echo "  make typecheck    - Run TypeScript type checks"
	@echo "  make lint         - Run ESLint checks"
	@echo "  make clean        - Remove build artifacts and node_modules"

install:
	pnpm install --frozen-lockfile

dev:
	pnpm dev

dev-docker:
	DOCKER_BUILDKIT=1 docker compose up --build

dev-down:
	docker compose down

build:
	pnpm build

docker-build:
	DOCKER_BUILDKIT=1 docker build \
		--build-arg NEXT_PUBLIC_SITE_URL=$(SITE_URL) \
		-t $(IMAGE_NAME):$(IMAGE_TAG) .

typecheck:
	pnpm typecheck

lint:
	pnpm lint

clean:
	rm -rf .next node_modules
