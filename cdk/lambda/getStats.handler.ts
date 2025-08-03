import "dotenv/config";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { StatsService } from "./services/stats.service";
import { createResponse } from "./utils/response";

type StatsType = "user" | "total";

const statsService = new StatsService(process.env.USER_STATS_TABLE || "");

function isValidStatsType(type: string | undefined): type is StatsType {
  return type === "user" || type === "total";
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!userId) {
      return createResponse(401, { message: "Unauthorized" });
    }

    // Get and validate the type of stats requested
    const statsType = event.queryStringParameters?.type;
    if (!isValidStatsType(statsType)) {
      return createResponse(400, {
        message: "Invalid stats type. Must be 'user' or 'total'",
      });
    }

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
