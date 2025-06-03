import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Spin,
  Modal,
  Empty,
  message,
  Avatar,
  Skeleton,
  ConfigProvider,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import { PostResponseModel } from "@/api/features/post/models/PostResponseModel";
import { UserModel } from "@/api/features/authenticate/model/LoginModel";
import useColor from "@/hooks/useColor";
import { useAuth } from "@/context/auth/useAuth";
import Post from "@/components/common/post/views/Post";
import AddPostScreen from "@/components/screens/addPost/view/AddPostScreen";
import EditPostViewModel from "@/components/features/editpost/viewModel/EditPostViewModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";

const PostList = ({
  loading,
  posts,
  loadMorePosts,
  user,
  fetchUserPosts,
  hasMore,
  setPosts,
}: {
  loading: boolean;
  posts: PostResponseModel[];
  loadMorePosts: () => void;
  user: UserModel;
  fetchUserPosts: () => void;
  hasMore: boolean; // Biến để kiểm tra có còn dữ liệu hay không
  setPosts: React.Dispatch<React.SetStateAction<PostResponseModel[]>>;
}) => {
  const { backgroundColor, lightGray, brandPrimary, borderColor } = useColor();
  const { isLoginUser, localStrings } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { deletePost } = EditPostViewModel(defaultPostRepo, user?.id || "", "");

  // State lưu danh sách id các post đang visible
  const [visiblePosts, setVisiblePosts] = useState<string[]>([]);
  // Ref lưu các DOM node của từng post
  const postRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handlePostSuccess = () => {
    setIsModalVisible(false);
    fetchUserPosts();
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  const renderAddPost = useCallback(() => {
    return (
      <>
        <div
          onClick={() => setIsModalVisible(true)}
          style={{
            padding: "10px",
            display: "flex",
            alignItems: "center",
            backgroundColor: backgroundColor,
            boxShadow:
              "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
            borderRadius: "10px",
            cursor: "pointer",
            width: "100%",
            maxWidth: "600px",
            position: "relative",
            border: `1px solid ${borderColor}`,
          }}
        >
          <Avatar
            src={user?.avatar_url}
            alt="User Avatar"
            size={{ xs: 40, sm: 40, md: 50, lg: 50, xl: 50, xxl: 50 }}
          />
          <div style={{ marginLeft: "10px", flex: 1, color: brandPrimary }}>
            <p>
              {user?.family_name + " " + user?.name ||
                localStrings.Public.Username}
            </p>
            <p style={{ color: "gray" }}>{localStrings.Public.Today}</p>
          </div>
          <span
            style={{
              position: "absolute",
              right: "10px",
              fontSize: "24px",
              fontWeight: "bold",
              color: brandPrimary || "#1890ff",
              backgroundColor: backgroundColor,
              padding: "5px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            +
          </span>
        </div>
        <ConfigProvider
          theme={{
            token: {
              colorText: brandPrimary,
            },
            components: {
              Modal: {
                contentBg: backgroundColor,
                headerBg: backgroundColor,
                titleColor: brandPrimary,
              },
            },
          }}
        >
          <Modal
            centered
            title={localStrings.AddPost.NewPost}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            width={800}
            footer={null}
          >
            <AddPostScreen onPostSuccess={handlePostSuccess} />
          </Modal>
        </ConfigProvider>
      </>
    );
  }, [user, backgroundColor, lightGray, localStrings, isModalVisible]);

  // Intersection Observer để theo dõi post nào đang visible
  useEffect(() => {
  if (!Array.isArray(posts) || posts.length === 0) return;


    const observer = new IntersectionObserver(
      (entries) => {
        // Lọc các post đang intersect với viewport (visible)
        const currentlyVisible: string[] = [];
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute("data-postid");
            if (postId) currentlyVisible.push(postId);
          }
        });
        setVisiblePosts(currentlyVisible);
      },
      {
        root: null, // viewport
        threshold: 0.5, // khi 50% phần tử hiển thị
      }
    );

    // Quan sát tất cả các phần tử post
    Object.values(postRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    // Cleanup khi unmount hoặc posts thay đổi
    return () => {
      observer.disconnect();
    };
  }, [posts]);

  return (
    <div className="w-auto flex flex-col items-center justify-center xl:items-end">
      {/* Nút thêm bài post */}
      {isLoginUser(user?.id as string) && renderAddPost()}

      {/* Danh sách bài post */}
      <div style={{ width: "100%" }}>
        {posts && posts.length > 0 ? (
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMorePosts}
            hasMore={hasMore}
            loader={<Skeleton avatar paragraph={{ rows: 4 }} />}
          >
            {posts.map((item) => (
              <div
                key={item?.id}
                data-postid={item?.id}
                ref={(el) => {
                  if (item.id !== undefined) {
                    postRefs.current[item.id] = el;
                  }
                }}
                className="w-full flex flex-col items-center xl:items-end"
              >
                <Post
                  post={item}
                  fetchUserPosts={fetchUserPosts}
                  onDeletePost={handleDeletePost}
                  isVisiblePost={visiblePosts.includes(item.id || "")}
                >
                  {item?.parent_post && (
                    <Post post={item?.parent_post} isParentPost isVisiblePost={visiblePosts.includes(item?.parent_post.id || "")} />
                  )}
                </Post>
              </div>
            ))}
          </InfiniteScroll>
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Empty
              description={
                <span style={{ color: "gray", fontSize: 16 }}>
                  {localStrings.Post.NoPosts}
                </span>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
