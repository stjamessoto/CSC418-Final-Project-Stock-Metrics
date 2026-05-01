#!/bin/sh
set -e

if [ -n "$DYNAMO_ENDPOINT" ]; then
  echo "Waiting for DynamoDB at $DYNAMO_ENDPOINT..."
  until python -c "
import boto3, os, sys
try:
    c = boto3.client(
        'dynamodb',
        region_name=os.environ.get('AWS_REGION', 'us-east-1'),
        endpoint_url=os.environ.get('DYNAMO_ENDPOINT'),
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID', 'local'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY', 'local'),
    )
    c.list_tables()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
    echo "  not ready yet, retrying in 2s..."
    sleep 2
  done
  echo "DynamoDB ready. Provisioning table..."
  python scripts/create_table.py
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000
