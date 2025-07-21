// lib/dynamodb-stack.ts

import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DynamoDBStack extends cdk.Stack {
  public readonly userStatsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userStatsTable = new dynamodb.Table(this, "UserStatsTable", {
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    this.userStatsTable.addGlobalSecondaryIndex({
      indexName: "totalStats",
      partitionKey: { name: "statType", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "count", type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
