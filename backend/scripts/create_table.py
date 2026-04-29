"""
Run once to provision the DynamoDB table and GSI.
Usage: python -m backend.scripts.create_table
"""
import os
from pathlib import Path
import boto3
from dotenv import load_dotenv

# Root .env lives three levels above this file (project root)
load_dotenv(dotenv_path=Path(__file__).resolve().parents[3] / ".env")

TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "StockMetrics")
REGION = os.getenv("AWS_REGION", "us-east-1")


def create_table():
    client = boto3.client(
        "dynamodb",
        region_name=REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )

    existing = [t["TableName"] for t in client.list_tables()["TableNames"]]
    if TABLE_NAME in existing:
        print(f"Table '{TABLE_NAME}' already exists — skipping.")
        return

    client.create_table(
        TableName=TABLE_NAME,
        AttributeDefinitions=[
            {"AttributeName": "PK", "AttributeType": "S"},
            {"AttributeName": "SK", "AttributeType": "S"},
            {"AttributeName": "industry", "AttributeType": "S"},
        ],
        KeySchema=[
            {"AttributeName": "PK", "KeyType": "HASH"},
            {"AttributeName": "SK", "KeyType": "RANGE"},
        ],
        GlobalSecondaryIndexes=[
            {
                "IndexName": "IndustryIndex",
                "KeySchema": [
                    {"AttributeName": "industry", "KeyType": "HASH"},
                ],
                "Projection": {"ProjectionType": "ALL"},
                "BillingMode": "PAY_PER_REQUEST",
            }
        ],
        BillingMode="PAY_PER_REQUEST",
    )

    waiter = client.get_waiter("table_exists")
    waiter.wait(TableName=TABLE_NAME)
    print(f"Table '{TABLE_NAME}' created successfully.")
    print(f"  PK: USER#{{userId}}  |  SK: TICKER#{{ticker}}  |  GSI: industry")


if __name__ == "__main__":
    create_table()
