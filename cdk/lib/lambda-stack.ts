import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as s3 from "aws-cdk-lib/aws-s3";

export class LambdaStack extends Stack {
  public readonly getPresignedUrlFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    props?: StackProps & { bucket: s3.IBucket }
  ) {
    super(scope, id, props);

    new NodejsFunction(this, "ModerateImageFunction", {
      runtime: Runtime.NODEJS_22_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/moderateImage.handler.ts"),
      bundling: {
        minify: true,
        sourceMap: true,
        target: "es2020",
        externalModules: ["aws-sdk"],
      },
    });

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

    // Grant S3 permissions to the function
    if (props?.bucket) {
      props.bucket.grantPut(this.getPresignedUrlFunction);
    }
  }
}
