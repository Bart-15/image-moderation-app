import "dotenv/config";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { StatsService } from "./services/stats.service";
import { createResponse } from "./utils/response";

type StatsType = "user" | "total";

const statsService = new StatsService(process.env.USER_STATS_TABLE || "");

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!userId) {
      return createResponse(401, { message: "Unauthorized" });
    }

    // Get the type of stats requested from query parameters
    const statsType = (event.queryStringParameters?.type || "") as StatsType;
    const response: {
      userStats?: { totalUploads: number; inappropriateUploads: number };
      totalStats?: { totalUploads: number; inappropriateUploads: number };
    } = {};

    // Get user stats if requested
    if (statsType === "user" || !statsType) {
      response.userStats = await statsService.getUserStats(userId);
    }

    // Get total stats if requested
    if (statsType === "total" || !statsType) {
      response.totalStats = await statsService.getTotalStats();
    }

    return createResponse(200, response);
  } catch (error) {
    console.error("Error:", error);
    return createResponse(500, { message: "Internal server error" });
  }
};
