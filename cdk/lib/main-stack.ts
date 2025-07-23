import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { S3Stack } from "./s3-stack";
import { LambdaStack } from "../lib/lambda-stack";
import { ApiGatewayStack } from "./api-gw-stack";
import { AuthStack } from "./auth-stack";
import { DynamoDBStack } from "./dynamodb-stack";
import { WebsiteHostingStack } from "./website-hosting-stack";

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authStack = new AuthStack(this, "AuthStack");

    const s3Stack = new S3Stack(this, "S3Stack");

    const dynamoStack = new DynamoDBStack(this, "DynamoDBStack");

    const lambdaStack = new LambdaStack(this, "LambdaStack", {
      bucket: s3Stack.bucket,
      userStatsTable: dynamoStack.userStatsTable,
    });

    new ApiGatewayStack(this, "ApiGatewayStack", {
      getPresignedUrlFunction: lambdaStack.getPresignedUrlFunction,
      moderateImageFunction: lambdaStack.moderateImageFunction,
      getStatsFunction: lambdaStack.getStatsFunction,
      userPool: authStack.userPool,
    });

    new WebsiteHostingStack(this, "WebsiteHostingStack");
  }
}
