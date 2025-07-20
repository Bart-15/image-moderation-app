import "dotenv/config";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectModerationLabelsCommand,
} from "@aws-sdk/client-rekognition";

const rekognitionClient = new RekognitionClient({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { key } = JSON.parse(event.body || "{}");

    if (!key || !process.env.BUCKET_NAME) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing image key or bucket name" }),
      };
    }
    const moderationCommand = new DetectModerationLabelsCommand({
      Image: {
        S3Object: {
          Bucket: process.env.BUCKET_NAME,
          Name: key,
        },
      },
      MinConfidence: 60, // Set lower threshold to be more strict
    });

    const moderationResponse = await rekognitionClient.send(moderationCommand);

    if (
      moderationResponse.ModerationLabels &&
      moderationResponse.ModerationLabels.length > 0
    ) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Image contains inappropriate content",
          isAppropriate: false,
          moderationLabels: moderationResponse.ModerationLabels,
        }),
      };
    }

    const labelsCommand = new DetectLabelsCommand({
      Image: {
        S3Object: {
          Bucket: process.env.BUCKET_NAME,
          Name: key,
        },
      },
      MaxLabels: 10,
      MinConfidence: 70,
    });

    const labelsResponse = await rekognitionClient.send(labelsCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        isAppropriate: true,
        labels: labelsResponse.Labels,
      }),
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to analyze image" }),
    };
  }
};
