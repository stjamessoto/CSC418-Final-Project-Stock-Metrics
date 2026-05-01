import os
import boto3

TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "StockMetrics")
REGION = os.getenv("AWS_REGION", "us-east-1")


def get_table():
    dynamodb = boto3.resource(
        "dynamodb",
        region_name=REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        endpoint_url=os.getenv("DYNAMO_ENDPOINT"),  # None = real AWS; set for local
    )
    return dynamodb.Table(TABLE_NAME)
