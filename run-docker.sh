#!/bin/bash
docker-compose --env-file .env convert
docker-compose up -d rabbitmq
docker-compose up -d