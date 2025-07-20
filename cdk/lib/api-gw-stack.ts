import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class ApiGatewayStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: cdk.StackProps & {
      getPresignedUrlFunction: lambda.IFunction;
      moderateImageFunction: lambda.IFunction;
    }
  ) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, "ImageModerationApi", {
      restApiName: "Image Moderation Service",
      description:
        "API for getting presigned URLs for image uploads and moderating images",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // TODO: Update this soon using correct environment
        allowMethods: ["OPTIONS", "POST", "GET"],
        allowHeaders: ["Content-Type"],
      },
    });

    const presignedUrl = api.root.addResource("presigned-url");
    presignedUrl.addMethod(
      "GET",
      new apigateway.LambdaIntegration(props?.getPresignedUrlFunction!, {
        proxy: true,
      })
    );

    const moderateImage = api.root.addResource("moderate");
    moderateImage.addMethod(
      "POST",
      new apigateway.LambdaIntegration(props?.moderateImageFunction!, {
        proxy: true,
      })
    );

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "API Gateway endpoint URL",
    });
  }
}
