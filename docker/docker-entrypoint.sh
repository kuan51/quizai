#!/bin/sh
set -e

echo "=== QuizAI Docker Entrypoint ==="

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if pg_isready -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; then
    echo "PostgreSQL is ready"
    break
  fi

  attempt=$((attempt + 1))
  echo "Waiting for PostgreSQL... ($attempt/$max_attempts)"
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "ERROR: PostgreSQL did not become ready in time"
  exit 1
fi

# Run database migrations
echo "Running database migrations..."
cd /app
if bun run db:migrate:run; then
  echo "Migrations completed successfully"
else
  echo "ERROR: Migration failed"
  exit 1
fi

# Start the application
echo "Starting QuizAI application..."
exec "$@"
