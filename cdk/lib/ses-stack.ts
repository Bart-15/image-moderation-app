import * as cdk from "aws-cdk-lib";
import * as ses from "aws-cdk-lib/aws-ses";
import { Construct } from "constructs";
import "dotenv/config";

export class SESStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create SES email identity
    const emailIdentity = new ses.EmailIdentity(this, "EmailIdentity", {
      identity: ses.Identity.email(process.env.SES_SENDER_EMAIL || ""),
    });

    // Output the identity ARN for reference
    new cdk.CfnOutput(this, "EmailIdentityArn", {
      value: emailIdentity.emailIdentityArn,
      description: "ARN of the verified email identity",
    });
  }
}
