import { NotificationResponseModel } from "@/api/features/notification/models/NotifiCationModel";
import { useAuth } from "@/context/auth/useAuth";
import useColor from "@/hooks/useColor";
import { getTimeDiff } from "@/utils/helper/DateTransfer";
import { Avatar, List } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import {
  IoArrowRedoCircle,
  IoChatbubbleEllipses,
  IoHeartCircle,
  IoNotificationsCircle,
  IoPersonCircle,
} from "react-icons/io5";

interface NotificationItemProps {
  notifications: NotificationResponseModel;
  onUpdate: () => void;
  onClickModal: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notifications,
  onUpdate,
  onClickModal,
}) => {
  const router = useRouter();
  const { from, from_url, content, created_at, notification_type = "", status, content_id } =
    notifications;
  const { localStrings } = useAuth();
  const {backGround, backgroundColor, theme, brandPrimary} = useColor();

  const typeMap: Record<
    string,
    { icon: React.ReactNode; color: string; type: string }
  > = {
    like_post: {
      icon: <IoHeartCircle />,
      color: "text-red-500",
      type: localStrings.Notification.Items.LikePost,
    },
    new_share: {
      icon: <IoArrowRedoCircle />,
      color: "text-blue-500",
      type: localStrings.Notification.Items.SharePost,
    },
    new_comment: {
      icon: <IoChatbubbleEllipses />,
      color: "text-green-500",
      type: localStrings.Notification.Items.CommentPost,
    },
    friend_request: {
      icon: <IoPersonCircle />,
      color: "text-gray-600",
      type: localStrings.Notification.Items.Friend,
    },
    accept_friend_request: {
      icon: <IoPersonCircle />,
      color: "text-gray-600",
      type: localStrings.Notification.Items.AcceptFriend,
    },
    new_post: {
      icon: <IoNotificationsCircle />,
      color: "text-black",
      type: localStrings.Notification.Items.NewPost,
    },
    like_comment: {
      icon: <IoHeartCircle />,
      color: "text-red-500",
      type: localStrings.Notification.Items.LikeComment,
    },
    new_post_personal: {
      icon: <IoNotificationsCircle />,
      color: "text-black",
      type: localStrings.Notification.Items.NewPostPersonal,
    },
    block_create_post: {
      icon: <IoNotificationsCircle />,
      color: "text-black",
      type: localStrings.Notification.Items.BlockCreatePost,
    },
    deactivate_post: {
      icon: <IoNotificationsCircle />,
      color: "text-black",
      type: localStrings.Notification.Items.DeactivatePostContent,
    },
    activace_post: {
      icon: <IoNotificationsCircle />,
      color: "text-black",
      type: localStrings.Notification.Items.ActivacePostContent,
    },
    deactivate_comment: {
      icon: <IoNotificationsCircle />,
      color: "text-black",
      type: localStrings.Notification.Items.DeactivateCommentContent,
    },
    activace_comment: {
      icon: <IoNotificationsCircle />,
      color: "text-black",
      type: localStrings.Notification.Items.ActivaceCommentContent,
    },
  };

  const notificationDetails =
    typeMap[notification_type] || {
      icon: <IoNotificationsCircle />,
      color: "text-black", 
    };

  const handleClick = () => {
    onUpdate();
    onClickModal();
    if (notification_type === "friend_request" || notification_type === "accept_friend_request") {
      router.push(`/user/${content_id}`);
    } else if (
      ["like_post", "new_comment", "new_share", "new_post", "new_post_personal", "like_comment"].includes(
        notification_type
      )
    ) {
      router.push(`/postDetails?postId=${content_id}`);
    }
  };

  const getDescription = (content: string) => {
    if (content.includes("violence")) return localStrings.Notification.Items.violence;
    if (content.includes("nsfw")) return localStrings.Notification.Items.nsfw;
    if (content.includes("political")) return localStrings.Notification.Items.political;
    if (content.includes("abuse")) return localStrings.Notification.Items.abuse;
    return content;
  };

  const ColorItem = theme === 'light' ? 'hover:bg-[#E2E2E2]' : 'hover:bg-[#62676B]';

  return (
    <List.Item
      onClick={handleClick}
      className={`${status ? backgroundColor : backGround} cursor-pointer transition-colors ${ColorItem} `}
      role="button"
      aria-label={`${from} ${notificationDetails.type}`}
    >
      <div className="flex items-center">
        <div className="relative mr-4">
          <Avatar src={from_url} size={40} className="bg-gray-300" />
          <div style={{backgroundColor: theme === "dark" ? '#fff' : 'transparent', borderRadius: 20}} className={`absolute bottom-[-5px] right-[-2px] text-lg ${notificationDetails.color}`}>
            {notificationDetails.icon}
          </div>
        </div>
        <div className="flex-1">
          <span style={{color: brandPrimary}} className="text-sm">
            <span className="font-semibold">{from}</span> {notificationDetails.type}
          </span>
          {content && (
            <p className="text-sm text-gray-500 truncate">{getDescription(content)}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {getTimeDiff(created_at, localStrings)}
          </p>
        </div>
      </div>
    </List.Item>
  );
};

export default NotificationItem;