import { useQuery } from "@tanstack/react-query";
import { keys } from "../../../config/queryKeys";
import { getStats } from "../../../services/app.service";

export function useGetStats() {
  return useQuery({
    queryKey: [keys.stats],
    queryFn: () => getStats(),
  });
}
