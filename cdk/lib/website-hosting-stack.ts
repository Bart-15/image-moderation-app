import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class WebsiteHostingStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for static website
    this.bucket = new s3.Bucket(this, "ImageModerationWebsiteBucket", {
      bucketName: `${cdk.Stack.of(
        this
      ).stackName.toLowerCase()}-website-bucket`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
    });

    // CloudFront OAI
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity",
      {
        comment: "OAI for Image Moderation Website",
      }
    );

    // Grant CloudFront read access to S3
    this.bucket.grantRead(originAccessIdentity);

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(
      this,
      "ImageModerationDistribution",
      {
        defaultBehavior: {
          origin: new origins.S3Origin(this.bucket, {
            originAccessIdentity,
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
      }
    );

    // Output the CloudFront URL
    new cdk.CfnOutput(this, "ImageModerationDistributionDomainName", {
      value: this.distribution.distributionDomainName,
      description: "Image Moderation Website URL",
    });

    // Deploy static files to S3
    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("../client/dist")],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ["/*"],
    });
  }
}
