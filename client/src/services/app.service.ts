import { axiosInstance } from "../utils/axios";

export async function getStats() {
  return await axiosInstance.get("/stats");
}
