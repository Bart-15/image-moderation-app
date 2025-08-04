import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface ApiGatewayStackProps extends cdk.StackProps {
  getPresignedUrlFunction: lambda.IFunction;
  moderateImageFunction: lambda.IFunction;
  getStatsFunction: lambda.IFunction;
  userPool: cognito.IUserPool;
}

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    // Create Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "ImageModerationAuthorizer",
      {
        cognitoUserPools: [props.userPool],
      }
    );

    const api = new apigateway.RestApi(this, "ImageModerationApi", {
      restApiName: "Image Moderation Service",
      description:
        "API for getting presigned URLs for image uploads and moderating images",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // Allow all origins, we'll handle specific origin validation in Lambda
        allowMethods: ["OPTIONS", "POST", "GET"],
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
      },
    });

    const presignedUrl = api.root.addResource("presigned-url");
    presignedUrl.addMethod(
      "GET",
      new apigateway.LambdaIntegration(props.getPresignedUrlFunction, {
        proxy: true,
      }),
      {
        authorizer: authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    const moderateImage = api.root.addResource("moderate");
    moderateImage.addMethod(
      "POST",
      new apigateway.LambdaIntegration(props.moderateImageFunction, {
        proxy: true,
      }),
      {
        authorizer: authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    const stats = api.root.addResource("stats");
    stats.addMethod(
      "GET",
      new apigateway.LambdaIntegration(props.getStatsFunction, {
        proxy: true,
      }),
      {
        authorizer: authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "API Gateway endpoint URL",
    });
  }
}
