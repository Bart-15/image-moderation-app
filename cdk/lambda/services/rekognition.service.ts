import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectModerationLabelsCommand,
} from "@aws-sdk/client-rekognition";

const rekognitionClient = new RekognitionClient({});

export class RekognitionService {
  async detectInappropriateContent(bucket: string, key: string) {
    const moderationCommand = new DetectModerationLabelsCommand({
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key,
        },
      },
      MinConfidence: 60,
    });

    const moderationResponse = await rekognitionClient.send(moderationCommand);
    return {
      isInappropriate: (moderationResponse.ModerationLabels || []).length > 0,
      moderationLabels: moderationResponse.ModerationLabels,
    };
  }

  async detectLabels(bucket: string, key: string) {
    const labelsCommand = new DetectLabelsCommand({
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key,
        },
      },
      MaxLabels: 10,
      MinConfidence: 70,
    });

    return rekognitionClient.send(labelsCommand);
  }
}
