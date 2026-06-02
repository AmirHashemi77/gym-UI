import { useMutation } from '@tanstack/react-query';
import { notificationsService } from '../../api/notifications.service';
import type { SendNotificationRequest } from '../../api/types';

export const useSendNotification = () =>
  useMutation({
    mutationFn: (payload: SendNotificationRequest) => notificationsService.send(payload),
  });
