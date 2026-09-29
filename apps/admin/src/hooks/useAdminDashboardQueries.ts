import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api";

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      return await apiGet<any>("/admin/dashboard/stats");
    },
  });
}
