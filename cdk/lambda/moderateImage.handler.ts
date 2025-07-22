import "dotenv/config";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectModerationLabelsCommand,
} from "@aws-sdk/client-rekognition";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const rekognitionClient = new RekognitionClient({});
const docClient = new DynamoDBClient({});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { key } = JSON.parse(event.body || "{}");

    // Get user ID from Cognito authorizer
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

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

    const isInappropriate =
      (moderationResponse.ModerationLabels || []).length > 0;

    // Update user statistics
    await docClient.send(
      new UpdateItemCommand({
        TableName: process.env.USER_STATS_TABLE,
        Key: { userId: { S: userId } },
        UpdateExpression: `
          SET totalUploads = if_not_exists(totalUploads, :zero) + :one,
              inappropriateUploads = if_not_exists(inappropriateUploads, :zero) ${
                isInappropriate ? "+ :one" : ""
              }`,
        ExpressionAttributeValues: {
          ":one": { N: "1" },
          ":zero": { N: "0" },
        },
      })
    );

    // Update total statistics
    await docClient.send(
      new UpdateItemCommand({
        TableName: process.env.USER_STATS_TABLE,
        Key: { userId: { S: "TOTAL" } },
        UpdateExpression: `
          SET totalUploads = if_not_exists(totalUploads, :zero) + :one,
              inappropriateUploads = if_not_exists(inappropriateUploads, :zero) ${
                isInappropriate ? "+ :one" : ""
              },
              statType = :statType`,
        ExpressionAttributeValues: {
          ":one": { N: "1" },
          ":zero": { N: "0" },
          ":statType": { S: "TOTAL" },
        },
      })
    );

    if (isInappropriate) {
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
