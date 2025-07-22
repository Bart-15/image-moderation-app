import "dotenv/config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

type StatsType = "user" | "total";

interface Stats {
  totalUploads: number;
  inappropriateUploads: number;
}

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

    // Get the type of stats requested from query parameters
    const statsType = (event.queryStringParameters?.type || "") as StatsType;

    const response: {
      userStats?: Stats;
      totalStats?: Stats;
    } = {};

    // Get user stats if requested
    if (statsType === "user" || !statsType) {
      const userStats = await docClient.send(
        new QueryCommand({
          TableName: process.env.USER_STATS_TABLE,
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
        })
      );

      response.userStats = {
        totalUploads: Number(userStats.Items?.[0]?.totalUploads ?? 0),
        inappropriateUploads: Number(
          userStats.Items?.[0]?.inappropriateUploads ?? 0
        ),
      };
    }

    // Get total stats if requested
    if (statsType === "total" || !statsType) {
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

      response.totalStats = {
        totalUploads: Number(totalStats.Items?.[0]?.totalUploads ?? 0),
        inappropriateUploads: Number(
          totalStats.Items?.[0]?.inappropriateUploads ?? 0
        ),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Configure this based on your frontend URL
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
