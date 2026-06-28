import { useQuery } from '@tanstack/react-query';
import { statsService } from '../../api/stats.service';
import { queryKeys } from '../queryKeys';

export const useCoachDashboard = () =>
  useQuery({
    queryKey: queryKeys.coach.dashboard,
    queryFn: () => statsService.getCoachDashboard(),
  });
