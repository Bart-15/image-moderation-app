import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { S3Stack } from "./s3-stack";
import { LambdaStack } from "../lib/lambda-stack";

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new S3Stack(this, "S3Stack");

    new LambdaStack(this, "LambdaStack");
  }
}
