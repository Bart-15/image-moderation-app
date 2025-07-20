import "dotenv/config";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const s3Client = new S3Client({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!process.env.BUCKET_NAME) {
      throw new Error("BUCKET_NAME environment variable is not set");
    }

    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const contentType = body.contentType || "image/jpeg"; // Default to JPEG if not specified
    const extension = contentType.split("/")[1] || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ url, fileName }),
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Failed to generate upload URL" }),
    };
  }
};
