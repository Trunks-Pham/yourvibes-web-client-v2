"use client";
import React, { useEffect, useCallback } from "react";
import { Button, Spin, Empty } from "antd";
import { CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import NotificationItem from "@/components/screens/notification/components/NotificationItem";
import useColor from "@/hooks/useColor";
import NotifiCationViewModel from "@/components/screens/notification/viewModel/NotifiCationViewModel";
import { defaultNotificationRepo } from "@/api/features/notification/NotifiCationRepo";
import { useAuth } from "@/context/auth/useAuth";
import InfiniteScroll from "react-infinite-scroll-component";

interface NotificationScreenProps {
  setNotificationModal: React.Dispatch<React.SetStateAction<boolean>>;
  notificationModal: boolean;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({
  setNotificationModal,
  notificationModal,
}) => {
  const { brandPrimary, backgroundColor } = useColor();
  const { notifications, loading, fetchNotifications, updateNotification, updateAllNotification, hasMore } =
    NotifiCationViewModel(defaultNotificationRepo);
  const { localStrings } = useAuth();

  const loadMoreNotifi = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(notifications.length / 10 + 1);
    }
  }, [fetchNotifications, notifications.length, loading, hasMore]);

  useEffect(() => {
    if (notificationModal && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [notificationModal, notifications.length, fetchNotifications]);

  return (
    <div className="flex flex-col h-full">
      <div
        className="w-full py-3 px-4 flex justify-between items-center border-b border-gray-200"
        style={{ backgroundColor }}
      >
        <span className="text-base font-semibold">{localStrings.Notification.Notification}</span>
        <Button
          type="text"
          icon={<CheckOutlined />}
          onClick={updateAllNotification}
          aria-label="Đánh dấu tất cả thông báo là đã đọc"
        />
      </div>
      <div
        id="scrollable-notification"
        className="px-2.5 overflow-y-auto"
        style={{ maxHeight: "min(60vh, 600px)" }}
      >
        {notifications.length > 0 ? (
          <InfiniteScroll
            dataLength={notifications.length}
            next={loadMoreNotifi}
            hasMore={hasMore}
            loader={<Spin indicator={<LoadingOutlined spin />} size="large" className="my-4" />}
            scrollableTarget="scrollable-notification"
          >
            {notifications.map((item) => (
              <NotificationItem
                key={item.id}
                notifications={item}
                onUpdate={() => updateNotification(item)}
                onClickModal={() => setNotificationModal(false)}
              />
            ))}
          </InfiniteScroll>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            {loading ? (
              <Spin indicator={<LoadingOutlined spin />} size="large" />
            ) : (
              <Empty description={localStrings.Notification.NoNotification} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationScreen;