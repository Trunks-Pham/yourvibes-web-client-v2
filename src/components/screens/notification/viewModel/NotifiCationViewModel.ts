import { NotificationResponseModel } from "@/api/features/notification/models/NotifiCationModel";
import { NotifiCationRepo } from "@/api/features/notification/NotifiCationRepo";
import { message } from "antd";
import { useState, useCallback } from "react";

const NotifiCationViewModel = (repo: NotifiCationRepo) => {
  const [notifications, setNotifications] = useState<NotificationResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const fetchNotifications = useCallback(async (newPage: number = 1) => {
    try {
      setLoading(true);
      const response = await repo.getNotifications({
        sort_by: "created_at",
        isDescending: true,
        page: newPage,
        limit,
      });

      if (!response?.error) {
        const newNotifications = response?.data || [];
        setNotifications((prev) => (newPage === 1 ? newNotifications : [...prev, ...newNotifications]));
        const { page: currentPage, limit: currentLimit, total: totalRecords } = response?.paging || {};
        setTotal(totalRecords || 0);
        setPage(currentPage || newPage);
        setHasMore((currentPage || newPage) * (currentLimit || limit) < (totalRecords || 0));
      } else {
        message.error(response?.message || "Failed to fetch notifications");
      }
    } catch (error) {
      message.error("An error occurred while fetching notifications");
    } finally {
      setLoading(false);
    }
  }, [repo]);

  const updateNotification = useCallback(async (data: NotificationResponseModel) => {
    if (!data.id) return;
    try {
      setLoading(true);
      const response = await repo.updateNotification(data);
      if (!response?.error) {
        setNotifications((prev) =>
          prev.map((item) => (item.id === data.id ? { ...item, status: true } : item))
        );
      } else {
        message.error(response?.message || "Failed to update notification");
      }
    } catch (error) {
      message.error("An error occurred while updating notification");
    } finally {
      setLoading(false);
    }
  }, [repo]);

  const updateAllNotification = useCallback(async () => {
    try {
      setLoading(true);
      const response = await repo.updateAllNotification();
      if (!response?.error) {
        setNotifications((prev) => prev.map((item) => ({ ...item, status: true })));
      } else {
        message.error(response?.message || "Failed to update all notifications");
      }
    } catch (error) {
      message.error("An error occurred while updating notifications");
    } finally {
      setLoading(false);
    }
  }, [repo]);

  const loadMoreNotifi = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchNotifications(page + 1);
    }
  }, [loading, hasMore, fetchNotifications, page]);

  return {
    notifications,
    loading,
    total,
    hasMore,
    fetchNotifications,
    updateNotification,
    updateAllNotification,
    loadMoreNotifi,
  };
};

export default NotifiCationViewModel;