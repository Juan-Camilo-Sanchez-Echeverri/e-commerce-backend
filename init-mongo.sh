#!/bin/bash
set -e

echo "Iniciando MongoDB..."

if [ -f /docker-entrypoint-initdb.d/startTickets ]; then
  echo "Restaurando la base de datos..."
  mongorestore --db store --archive=/docker-entrypoint-initdb.d/startStore
  echo "Restauración completa."
fi

exec mongod
