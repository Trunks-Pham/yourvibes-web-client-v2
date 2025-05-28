"use client";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Dropdown, Empty, Modal, Spin } from "antd";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoadingOutlined } from "@ant-design/icons";
import { FriendResponseModel } from "@/api/features/profile/model/FriendReponseModel";
import { useAuth } from "@/context/auth/useAuth";
import useColor from "@/hooks/useColor";
import UserProfileViewModel from "../viewModel/UserProfileViewModel";

const ListFriends = ({
  friends,
  hasMoreFriends,
  friendModal,
  loadMoreFriends,
  setFriends,
  fetchFriendsModal,
  loadingFriends,
}: {
  friends: FriendResponseModel[];
  hasMoreFriends: boolean;
  friendModal: boolean;
  loadMoreFriends: () => void;
  setFriends: React.Dispatch<React.SetStateAction<FriendResponseModel[]>>;
  fetchFriendsModal: (page?: number) => Promise<void>;
  loadingFriends: boolean;
}) => {
  const { localStrings, isLoginUser } = useAuth();
  const router = useRouter();
  const { unFriend } = UserProfileViewModel();
  const { colorOnl } = useColor();

  const handleUnfriend = async (friendId: string) => {
    try {
      await unFriend(friendId);
      setFriends(friends.filter((f) => f.id !== friendId));
    } catch (err) {
      console.error("Unfriend failed:", err);
    }
  };
  useEffect(() => {
    if (friendModal) {
      fetchFriendsModal(1);
    }
  }, [friendModal]);

  const itemsFriend = (friend: FriendResponseModel) => [
    {
      key: "1",
      label: localStrings.Public.UnFriend,
      onClick: () => {
        Modal.confirm({
          centered: true,
          title: localStrings.Public.Confirm,
          content: localStrings.Profile.Friend.UnfriendConfirm,
          okText: localStrings.Public.Confirm,
          cancelText: localStrings.Public.Cancel,
          onOk: () => handleUnfriend(friend.id as string),
        });
      },
    },
    {
      key: "2",
      label: localStrings.ListFriends.ViewProfile,
      onClick: () => router.push(`/user/${friend.id}`),
    },
  ];

  return (
    <div
      id="scrollableFriendList"
      className="overflow-y-auto h-[60vh] px-2 no-scrollbar"
    >
      {friends && friends.length > 0 ? (
        <InfiniteScroll
          dataLength={friends.length}
          next={() => {
            console.log("NEXT TRIGGERED!");
            loadMoreFriends();
          }}
          hasMore={hasMoreFriends}
          loader={
            <Spin
              indicator={<LoadingOutlined spin />}
              size="large"
              className="my-4"
            />
          }
          scrollableTarget="scrollableFriendList" // **Rất quan trọng để scroll trong vùng này**
          scrollThreshold={0.7} // Khi cuộn đến 70% thì gọi next()
        >
          {friends.map((friendItem, index) => (
            <div
              key={friendItem.id ?? index}
              className="flex flex-row items-center p-2 border rounded-md mb-5"
            >
              <div
                className="flex flex-row items-center"
                onClick={() => router.push(`/user/${friendItem.id}`)}
              >
                <div style={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    src={friendItem.avatar_url}
                    size={50}
                    alt={`${friendItem.family_name} ${friendItem.name}`}
                  />

                  {friendItem.active_status && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 12,
                        height: 12,
                        backgroundColor: colorOnl || "#00CED1",
                        border: "2px solid white",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </div>
                <span className="ml-4 text-lg font-semibold">
                  {friendItem.family_name} {friendItem.name}
                </span>
              </div>

              {friendItem.id && !isLoginUser(friendItem.id) && (
                <Dropdown
                  menu={{ items: itemsFriend(friendItem) }}
                  placement="bottom"
                  arrow
                >
                  <IoEllipsisVerticalSharp className="ml-auto" />
                </Dropdown>
              )}
            </div>
          ))}
        </InfiniteScroll>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          {loadingFriends ? (
            <Spin
              indicator={<LoadingOutlined spin />}
              size="large"
              className="my-4"
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: "gray" }}>
                  {localStrings.Public.AllUsers}
                </span>
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ListFriends;
