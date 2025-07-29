import "dotenv/config";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { RekognitionService } from "./services/rekognition.service";
import { StatsService } from "./services/stats.service";
import { ImageModerationRequest, ImageModerationResponse } from "./types/api";
import { createResponse } from "./utils/response";

const rekognitionService = new RekognitionService();
const statsService = new StatsService(process.env.USER_STATS_TABLE || "");

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { key } = JSON.parse(event.body || "{}") as ImageModerationRequest;
    const userId = event.requestContext.authorizer?.claims?.sub;

    if (!userId) {
      return createResponse(401, { message: "Unauthorized" });
    }

    if (!key || !process.env.BUCKET_NAME) {
      return createResponse(400, {
        message: "Missing image key or bucket name",
      });
    }

    // Check for inappropriate content
    const { isInappropriate, moderationLabels } =
      await rekognitionService.detectInappropriateContent(
        process.env.BUCKET_NAME,
        key
      );

    // Update statistics
    await Promise.all([
      statsService.updateUserStats(userId, isInappropriate),
      statsService.updateTotalStats(isInappropriate),
    ]);

    if (isInappropriate) {
      return createResponse(200, {
        message: "Image contains inappropriate content",
        isAppropriate: false,
        moderationLabels,
      });
    }

    // Get image labels
    const labelsResponse = await rekognitionService.detectLabels(
      process.env.BUCKET_NAME,
      key
    );

    return createResponse(200, {
      isAppropriate: true,
      labels: labelsResponse.Labels,
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return createResponse(500, { error: "Failed to analyze image" });
  }
};
