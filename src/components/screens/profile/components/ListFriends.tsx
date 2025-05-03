import { useState } from 'react';
import { useAuth } from '@/context/auth/useAuth';
import React from 'react';
import { IoEllipsisVerticalSharp } from 'react-icons/io5';
import { FriendResponseModel } from '@/api/features/profile/model/FriendReponseModel';
import { useRouter } from 'next/navigation';
import { Avatar, Dropdown, MenuProps, Modal } from 'antd';
import UserProfileViewModel from '../viewModel/UserProfileViewModel';
import useColor from '@/hooks/useColor';

const ListFriends = ({
  friends: initialFriends, // Nhận danh sách bạn bè ban đầu từ props
  page,
  setPage,
  totalPage,
}: {
  friends: FriendResponseModel[],
  page: number;
	setPage: (page: number) => void;
	totalPage: number;
}) => {
  const { localStrings, isLoginUser } = useAuth();
  const router = useRouter();
  const { unFriend } = UserProfileViewModel();
  const [friends, setFriends] = useState<FriendResponseModel[]>(initialFriends);
  const {colorOnl} = useColor();

  const handleUnfriend = async (friendId: string) => {
    try {
      await unFriend(friendId); // Gọi hàm xóa bạn bè
      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.id !== friendId)
      ); // Loại bỏ bạn bè đã xóa khỏi danh sách
    } catch (error) {
      console.error('Failed to unfriend:', error);
    }
  };

  const itemsFriend = (friend: FriendResponseModel): MenuProps['items'] => [
      {
        key: '1',
        label: localStrings.Public.UnFriend,
        type: 'item',
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
        key: '2',
        label: localStrings.ListFriends.ViewProfile,
        type: 'item',
        onClick: () => {
          router.push(`/user/${friend.id}`);
        },
      },
    ];

  return (
    <div className="m-2 grid md:grid-cols-2 gap-x-4 gap-y-2 cursor-pointer">
      {friends.map((friend, index) => (
        <div
          key={index}
          className="flex flex-row items-center p-2 border rounded-md"
        >
          <div
            className="flex flex-row items-center"
            onClick={() => router.push(`/user/${friend.id}`)}
          >
      <div style={{ position: "relative", display: "inline-block" }}>
       <Avatar
         src={friend.avatar_url}
         alt={friend.name}
         size={50}
         style={{
           boxShadow: "0 2px 4px rgba(186, 141, 167, 0.1)",
         }}
       />
       {friend.active_status && (
         <span
           style={{
             position: "absolute",
             bottom: 0,
             right: 0,
             width: 12,
             height: 12,
             backgroundColor: colorOnl || "#00CED1",
             border: "2px solid white", // để tạo viền trắng giống Messenger
             borderRadius: "50%",
           }}
         />
       )}
     </div>
            <span className="ml-4 text-lg font-semibold">
              {friend.family_name} {friend.name}
            </span>
          </div>
      {/* {friend.id && !isLoginUser(friend.id) &&
		  (
			<Dropdown menu={{ items: itemsFriend(friend) }} placement="bottom" arrow>
            <IoEllipsisVerticalSharp className="ml-auto" />
          </Dropdown>
		  )
		  } */}
          
        </div>
      ))}
    </div>
  );
};

export default ListFriends;