import "dotenv/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Get user ID from Cognito authorizer
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    // Query user's stats
    const userStats = await docClient.send(
      new QueryCommand({
        TableName: process.env.USER_STATS_TABLE,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );

    // Query total stats using GSI
    const totalStats = await docClient.send(
      new QueryCommand({
        TableName: process.env.USER_STATS_TABLE,
        IndexName: "totalStats",
        KeyConditionExpression: "statType = :type",
        ExpressionAttributeValues: {
          ":type": "TOTAL",
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        userStats: userStats.Items?.[0] || {
          totalUploads: 0,
          inappropriateUploads: 0,
        },
        totalStats: totalStats.Items?.[0] || {
          totalUploads: 0,
          inappropriateUploads: 0,
        },
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
