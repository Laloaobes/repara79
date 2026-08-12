import apiClient from '../../../api/axios';

export interface AppNotification {
  id: string;
  type?: string | null;
  title: string;
  message: string;
  url?: string | null;
  read_at: string | null;
  created_at: string;
}

const notificationsService = {
  async getAll(): Promise<{ items: AppNotification[]; unread: number }> {
    const response = await apiClient.get('/notifications');
    return { items: response.data.data, unread: response.data.unread_count };
  },
  async read(id: string): Promise<void> { await apiClient.patch(`/notifications/${id}/read`); },
  async readAll(): Promise<void> { await apiClient.patch('/notifications/read-all'); },
};

export default notificationsService;
