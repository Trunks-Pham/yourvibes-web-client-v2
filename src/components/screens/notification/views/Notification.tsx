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
  const {
    notifications,
    loading,
    fetchNotifications,
    updateNotification,
    updateAllNotification,
    hasMore,
    loadMoreNotifi
  } = NotifiCationViewModel(defaultNotificationRepo);
  const { localStrings } = useAuth();

  useEffect(() => {
    if (notificationModal && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [notificationModal, notifications.length, fetchNotifications]);

  return (
    <div className="flex flex-col h-[70vh]">
      <div
        className="w-full py-3 px-4 flex justify-between items-center border-b border-gray-200"
        style={{ backgroundColor }}
      >
        <span className="text-base font-semibold">
          {localStrings.Notification.Notification}
        </span>
        <Button
          type="text"
          icon={<CheckOutlined />}
          onClick={updateAllNotification}
          aria-label="Đánh dấu tất cả thông báo là đã đọc"
        />
      </div>

      <div
        id="scrollable-notification"
        className="px-2.5 overflow-y-auto no-scrollbar flex-1"
      >
        {notifications && notifications.length > 0 ? (
          <InfiniteScroll
            dataLength={notifications.length}
            next={loadMoreNotifi}
            hasMore={hasMore}
            loader={
              <Spin
                indicator={<LoadingOutlined spin />}
                size="large"
                className="my-4"
              />
            }
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
              <Empty description={  <span style={{ color: 'gray' }}>
      {localStrings.Notification.NoNotification}
    </span>} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationScreen;
