import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

interface Stats {
  totalUploads: number;
  inappropriateUploads: number;
}

export class StatsService {
  constructor(private readonly tableName: string) {}

  async getUserStats(userId: string): Promise<Stats> {
    const userStats = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );

    return {
      totalUploads: Number(userStats.Items?.[0]?.totalUploads ?? 0),
      inappropriateUploads: Number(
        userStats.Items?.[0]?.inappropriateUploads ?? 0
      ),
    };
  }

  async getTotalStats(): Promise<Stats> {
    const totalStats = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "totalStats",
        KeyConditionExpression: "statType = :type",
        ExpressionAttributeValues: {
          ":type": "TOTAL",
        },
      })
    );

    return {
      totalUploads: Number(totalStats.Items?.[0]?.totalUploads ?? 0),
      inappropriateUploads: Number(
        totalStats.Items?.[0]?.inappropriateUploads ?? 0
      ),
    };
  }

  async updateUserStats(userId: string, isInappropriate: boolean) {
    await docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { userId },
        UpdateExpression: `
          SET totalUploads = if_not_exists(totalUploads, :zero) + :one,
              inappropriateUploads = if_not_exists(inappropriateUploads, :zero) ${
                isInappropriate ? "+ :one" : ""
              }`,
        ExpressionAttributeValues: {
          ":one": 1,
          ":zero": 0,
        },
      })
    );
  }

  async updateTotalStats(isInappropriate: boolean) {
    await docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { userId: "TOTAL" },
        UpdateExpression: `
          SET totalUploads = if_not_exists(totalUploads, :zero) + :one,
              inappropriateUploads = if_not_exists(inappropriateUploads, :zero) ${
                isInappropriate ? "+ :one" : ""
              },
              statType = :statType`,
        ExpressionAttributeValues: {
          ":one": 1,
          ":zero": 0,
          ":statType": "TOTAL",
        },
      })
    );
  }
}
