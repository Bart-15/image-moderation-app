import { APIGatewayProxyResult } from "aws-lambda";

export function createResponse<T>(
  statusCode: number,
  body: Partial<T>
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
