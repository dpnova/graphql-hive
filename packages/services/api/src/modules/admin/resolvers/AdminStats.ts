import { parseDateRangeInput } from '../../../shared/helpers';
import { AdminManager } from '../providers/admin-manager';
import type { AdminStatsResolvers } from './../../../__generated__/types.next';

export const AdminStats: AdminStatsResolvers = {
  general: async ({ period, resolution }) => {
    return { period, resolution };
  },
  organizations: async ({ period }, _arg, { injector }) => {
    const dateRange = parseDateRangeInput(period);
    return injector.get(AdminManager).getStats({
      from: dateRange.from,
      to: dateRange.to,
    });
  },
};
