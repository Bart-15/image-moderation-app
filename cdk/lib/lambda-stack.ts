import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class LambdaStack extends Stack {
  public readonly getPresignedUrlFunction: NodejsFunction;
  public readonly moderateImageFunction: NodejsFunction;
  public readonly getStatsFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    props?: StackProps & { bucket: s3.IBucket; userStatsTable: dynamodb.Table }
  ) {
    super(scope, id, props);

    // Create the moderate image function
    this.moderateImageFunction = new NodejsFunction(
      this,
      "ModerateImageFunction",
      {
        runtime: Runtime.NODEJS_22_X,
        handler: "handler",
        entry: path.join(__dirname, "../lambda/moderateImage.handler.ts"),
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2020",
          externalModules: ["aws-sdk"],
        },
        environment: {
          BUCKET_NAME: props?.bucket.bucketName || "",
          USER_STATS_TABLE: props?.userStatsTable.tableName || "",
        },
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              "rekognition:DetectLabels",
              "rekognition:DetectModerationLabels",
            ],
            resources: ["*"],
          }),
        ],
      }
    );

    // Create the presigned URL generator function
    this.getPresignedUrlFunction = new NodejsFunction(
      this,
      "GetPresignedUrlFunction",
      {
        runtime: Runtime.NODEJS_22_X,
        handler: "handler",
        entry: path.join(__dirname, "../lambda/getPresignedUrl.handler.ts"),
        bundling: {
          minify: true,
          sourceMap: true,
          target: "es2020",
          externalModules: ["aws-sdk"],
        },
        environment: {
          BUCKET_NAME: props?.bucket.bucketName || "",
        },
      }
    );

    this.getStatsFunction = new NodejsFunction(this, "GetStatsFunction", {
      entry: "lambda/getStats.handler.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_22_X,
      environment: {
        USER_STATS_TABLE: props?.userStatsTable.tableName || "",
      },
    });

    // Grant S3 permissions to the function
    if (props?.bucket) {
      props.bucket.grantReadWrite(this.getPresignedUrlFunction); // Grant both read and write permissions
      props.bucket.grantRead(this.moderateImageFunction);
    }

    //Grant DynamoDB permissions
    if (props?.userStatsTable) {
      props.userStatsTable.grantReadWriteData(this.moderateImageFunction);
      props.userStatsTable.grantReadWriteData(this.getStatsFunction);

      // Add GSI permissions
      this.getStatsFunction.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["dynamodb:Query", "dynamodb:Scan"],
          resources: [
            props.userStatsTable.tableArn,
            `${props.userStatsTable.tableArn}/index/*`, // Grant access to all indexes
          ],
        })
      );
    }
  }
}
