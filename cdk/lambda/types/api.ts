export interface ImageModerationRequest {
  key: string;
}

export interface ImageModerationResponse {
  isAppropriate?: boolean;
  message?: string;
  moderationLabels?: any[];
  labels?: any[];
  error?: string;
}

export interface UserStats {
  userId: string;
  totalUploads: number;
  inappropriateUploads: number;
  statType?: "TOTAL";
}
