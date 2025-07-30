import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { ModerationLabel } from "@aws-sdk/client-rekognition";
import "dotenv/config";

export class SESService {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({ region: process.env.AWS_REGION });
  }

  private generateEmailTemplate(
    imageKey: string,
    moderationLabels: ModerationLabel[]
  ): string {
    const labelsList = moderationLabels
      .map(
        (label) =>
          `<li>${label.Name}: ${(label.Confidence || 0).toFixed(
            2
          )}% confidence</li>`
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #ff4444;
              color: white;
              padding: 20px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .content {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 5px;
              border: 1px solid #ddd;
            }
            .labels {
              margin-top: 15px;
              padding-left: 20px;
            }
            .footer {
              margin-top: 20px;
              font-size: 0.9em;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>⚠️ Inappropriate Content Detected</h2>
          </div>
          <div class="content">
            <p>Our content moderation system has detected potentially inappropriate content in an uploaded image.</p>
            <p><strong>Image Key:</strong> ${imageKey}</p>
            <h3>Detected Content Issues:</h3>
            <ul class="labels">
              ${labelsList}
            </ul>
            <p>Please review this content as soon as possible and take appropriate action.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from your Image Moderation System.</p>
          </div>
        </body>
      </html>
    `;
  }

  async sendInappropriateContentEmail(
    imageKey: string,
    moderationLabels: ModerationLabel[]
  ): Promise<void> {
    const emailTemplate = this.generateEmailTemplate(
      imageKey,
      moderationLabels
    );

    const command = new SendEmailCommand({
      Source: process.env.SES_SENDER_EMAIL ?? "",
      Destination: {
        ToAddresses: [process.env.NOTIFICATION_EMAIL ?? ""],
      },
      Message: {
        Subject: {
          Data: "🚨 Inappropriate Content Alert - Image Moderation System",
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: emailTemplate,
            Charset: "UTF-8",
          },
        },
      },
    });

    try {
      await this.sesClient.send(command);
    } catch (error) {
      console.error("Failed to send email notification:", error);
      throw error;
    }
  }
}
