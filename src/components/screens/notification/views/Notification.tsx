"use client"
import React, { useEffect, useCallback } from 'react';
import {
  List,
  Avatar,
  Button,
  Spin,
  Typography,
  Space,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import NotificationItem from '../components/NotificationItem';
import useColor from '@/hooks/useColor';
import NotifiCationViewModel from '../viewModel/NotifiCationViewModel';
import { defaultNotificationRepo } from '@/api/features/notification/NotifiCationRepo';
import { useAuth } from '@/context/auth/useAuth';


const NotificationScreen = ({setNotificationModal}:{setNotificationModal:React.Dispatch<React.SetStateAction<boolean>>}) => {
  const { brandPrimary, backgroundColor } = useColor();
  const { notifications, loading, fetchNotifications,  loadMoreNotifi, updateNotification,updateAllNotification } = NotifiCationViewModel(defaultNotificationRepo);
  const { localStrings } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);


  // Render footer for loading state
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <div className="py-4 flex justify-center">
        <Spin size="large" style={{ color: brandPrimary }} />
      </div>
    );
  };

  return (
    <div>
        {/* <div className='border rounded-md border-solidborder-gray-900'> */}
            {/* Header */}
            {/* <div
                className="w-full py-3 px-4 flex justify-between items-center"
                style={{ backgroundColor }}
            >

                <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={updateAllNotification}
                />
            </div> */}

            {/* Content */}
            <div className="flex-grow overflow-auto border-t border-gray-300">
                <div className="h-full overflow-auto">
                <List
                    dataSource={notifications}
                    renderItem={(item) => (
                    <NotificationItem
                        notifications={item}
                        onUpdate={() => updateNotification(item)}
                        onClickModal={()=>setNotificationModal(false)}
                    />
                    )}
                    className="h-full"
                />
                </div>
            </div>
        {/* </div> */}
    </div>
  );
};

export default NotificationScreen;