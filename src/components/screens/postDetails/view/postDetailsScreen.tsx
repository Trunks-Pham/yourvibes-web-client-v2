import React, { useEffect, useRef, useState } from "react";
import Post from "@/components/common/post/views/Post";
import { Typography, Modal, Spin } from "antd";
import { FaArrowLeft } from "react-icons/fa";
import PostDetailsViewModel from "@/components/screens/postDetails/viewModel/postDetailsViewModel";
import { useAuth } from "@/context/auth/useAuth";
import useColor from "@/hooks/useColor";
import { PostResponseModel } from "@/api/features/post/models/PostResponseModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import ReportViewModel from "@/components/screens/report/ViewModel/reportViewModel";
import ReportScreen from "../../report/views/Report";
import EmojiPicker from "emoji-picker-react";
import { useRouter } from "next/navigation";
import CommentItem from "@/components/screens/postDetails/components/CommentItem";

interface CommentsScreenProps {
  postId?: string;
  isModal?: boolean;
}
const { Text } = Typography;

const PostDetailsScreen: React.FC<CommentsScreenProps> = ({ postId, isModal }) => {
  const {
    comments,
    replyMap,
    likeCount,
    newComment,
    isEditModalVisible,
    editCommentContent,
    handleLike,
    handleDelete,
    setEditCommentContent,
    replyContent,
    setReplyContent,
    handlePostAction,
    handleTextChange,
    replyToCommentId,
    replyToReplyId,
    fetchReplies,
    setEditModalVisible,
    handleUpdate,
    toggleRepliesVisibility,
    handleReplyClick,
    handleShowEditModal,
    setVisibleReplies,
    visibleReplies,
    fetchComments,
    heartColors,
    setLikedComment,
    likedComment,
    setNewComment,
    loadMoreComments,
    isLoading,
    hasMore,
    isPosting,
  } = PostDetailsViewModel(postId || "", defaultPostRepo);
  const {
    theme,
    brandPrimary,
    brandPrimaryTap,
    backgroundColor,
    lightGray,
    borderBirth,
    colorOnl,
    backGround,
    borderColor,
    menuItem,
    darkSlate,
    darkGray,
    backgroundAddPost,
  } = useColor();
  const [post, setPost] = useState<PostResponseModel | null>(null);
  const [loading, setLoading] = useState(false);
  const { localStrings } = useAuth();
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [isReplyModalVisible, setReplyModalVisible] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const router = useRouter();
  const { showModal, setShowModal } = ReportViewModel();
  const [currentCommentId, setCurrentCommentId] = useState<string>("");
  const [editCommnetId, setEditCommentId] = useState<string>("");
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState({
    reply: false,
    comment: false,
    editCommet: false,
  });
  const emojiPickerRefReply = useRef(null);
  const emojiPickerRefComment = useRef(null);
  const emojiPickerRefEditComment = useRef(null);

  const isContentLengthValid = (content: string) => {
    const contentLength = content.trim().length;
    return contentLength >= 2 && contentLength <= 500;
  };

  const handleEmojiClick = (emojiObject: any) => {
    setNewComment((prevComment) => prevComment + emojiObject.emoji);
  };

  const handleEmojiClickReply = (emojiObject: any) => {
    setReplyContent((prevComment) => prevComment + emojiObject.emoji);
  };

  const handleEmojiClickEdit = (emojiObject: any) => {
    setEditCommentContent((prevComment) => prevComment + emojiObject.emoji);
  };

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      const post = await defaultPostRepo.getPostById(postId);
      if (!post.error) {
        setPost(post.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      comments.forEach((comment) => {
        fetchReplies(postId, comment.id);
      });
    }
  }, [postId, comments]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreComments();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, isLoading, loadMoreComments]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      showEmojiPicker.reply &&
      emojiPickerRefReply.current &&
      !(emojiPickerRefReply.current as HTMLElement).contains(event.target as Node)
    ) {
      setShowEmojiPicker((prev) => ({ ...prev, reply: false }));
    }
    if (
      showEmojiPicker.comment &&
      emojiPickerRefComment.current &&
      !(emojiPickerRefComment.current as HTMLElement).contains(event.target as Node)
    ) {
      setShowEmojiPicker((prev) => ({ ...prev, comment: false }));
    }
    if (
      showEmojiPicker.editCommet &&
      emojiPickerRefEditComment.current &&
      !(emojiPickerRefEditComment.current as HTMLElement).contains(event.target as Node)
    ) {
      setShowEmojiPicker((prev) => ({ ...prev, editCommet: false }));
    }
  };

  useEffect(() => {
    if (showEmojiPicker.reply || showEmojiPicker.comment || showEmojiPicker.editCommet) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const reportComment = (commentId: string) => {
    setCurrentCommentId(commentId);
    setShowModal(true);
  };

  return (
    <div className="p-2.5">
      {isModal === false && (
        <div className="mb-2 flex items-center">
          <FaArrowLeft
            style={{
              fontSize: "20px",
              color: brandPrimary,
              cursor: "pointer",
              marginRight: "10px",
            }}
            onClick={() => router.back()}
          />
          <Text style={{ fontSize: "18px", marginLeft: "10px", color: brandPrimary }}>
            {localStrings.Public.Post}
          </Text>
        </div>
      )}
      <div className="container mx-auto flex flex-col xl:flex-row gap-6">
        <Post noComment={true} post={post || undefined}>
          {post?.parent_post && <Post post={post?.parent_post} isParentPost />}
        </Post>
        <div
          className="mt-[15px] comments-container flex-1 p-6 rounded-lg shadow-md"
          style={{ backgroundColor: backgroundColor }}
        >
          <span className="text-lg font-semibold" style={{ color: brandPrimary }}>
            {localStrings.Public.Comment}
          </span>
          <div
            className="comments-list space-y-6 max-h-[70vh] overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replyMap={replyMap}
                heartColors={heartColors}
                handleLike={handleLike}
                handleDelete={handleDelete}
                handleShowEditModal={(commentId, content) => {
                  handleShowEditModal(commentId, content);
                  setEditCommentId(commentId);
                }}
                handleReplyClick={handleReplyClick}
                fetchReplies={fetchReplies}
                fetchComments={fetchComments}
                toggleRepliesVisibility={toggleRepliesVisibility}
                visibleReplies={visibleReplies}
                setLikedComment={setLikedComment}
                likedComment={likedComment}
                reportComment={reportComment}
                setReplyModalVisible={setReplyModalVisible}
                setSelectedCommentId={setSelectedCommentId}
                postId={postId || ""}
                likeCount={likeCount || 0}
              />
            ))}
            {hasMore && (
              <div ref={observerRef} className="text-center py-4">
                {isLoading ? (
                  <Spin tip={localStrings.PostDetails.LoadMore}/>
                ) : (
                  <Text style={{ color: brandPrimary }}>{localStrings.PostDetails.ScrollLoading}</Text>
                )}
              </div>
            )}
          </div>
          <div className="add-comment mt-2">
            <div className="relative">
              <textarea
                className="comment-input w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
                placeholder={
                  replyToCommentId || replyToReplyId
                    ? `${localStrings.Public.ReplyClick}`
                    : `${localStrings.Public.CommentClick}`
                }
                value={newComment}
                onChange={handleTextChange}
                disabled={isPosting}
                style={{
                  backgroundColor: backgroundAddPost,
                  color: brandPrimary,
                  border: `1px solid ${borderColor}`,
                }}
              />
              <Text
                type={newComment.length > 500 ? "danger" : "secondary"}
                style={{ float: "right", marginTop: 4, color: newComment.length > 500 ? borderBirth : darkGray }}
              >
                {newComment.length}/{localStrings.PostDetails.CommentLimit}
              </Text>
              <button
                type="button"
                onClick={() =>
                  setShowEmojiPicker((prev) => ({ ...prev, comment: !prev.comment }))
                }
                className="absolute right-3 top-4 text-lg rounded-full p-1"
                disabled={isPosting}
                style={{
                  backgroundColor: lightGray,
                  color: brandPrimary,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkGray)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = lightGray)}
              >
                😊
              </button>
            </div>
            {showEmojiPicker.comment && (
              <div
                ref={emojiPickerRefComment}
                className="absolute bottom-1 xl:top-1 right-3 z-10 rounded-lg shadow-md"
                style={{ backgroundColor: backgroundColor, border: `1px solid ${borderColor}` }}
              >
                <EmojiPicker
                  onEmojiClick={(emojiObject) => handleEmojiClick(emojiObject)}
                  width={250}
                  height={400}
                />
              </div>
            )}
            <div className="relative">
              <button
                onClick={handlePostAction}
                className="post-btn mt-4 w-full py-2 rounded-lg transition duration-300"
                disabled={!isContentLengthValid(newComment) || isPosting}
                style={{
                  backgroundColor: isContentLengthValid(newComment) && !isPosting ? brandPrimary : darkGray,
                  color: backgroundColor,
                }}
                onMouseEnter={(e) =>
                  isContentLengthValid(newComment) && !isPosting
                    ? (e.currentTarget.style.backgroundColor = brandPrimaryTap)
                    : null
                }
                onMouseLeave={(e) =>
                  isContentLengthValid(newComment) && !isPosting
                    ? (e.currentTarget.style.backgroundColor = brandPrimary)
                    : null
                }
              >
                {isPosting ? (
                  <Spin size="small" tip="Đang đăng bình luận..." />
                ) : (
                  localStrings.Public.Comment ||
                  (replyToCommentId || replyToReplyId ? "Reply" : "Post")
                )}
              </button>
            </div>
          </div>
          {isReplyModalVisible && (
            <Modal
              title={`${localStrings.Public.Reply}`}
              centered
              visible={isReplyModalVisible}
              onCancel={() => setReplyModalVisible(false)}
              onOk={() => {
                if (isContentLengthValid(replyContent)) {
                  handlePostAction();
                  setReplyModalVisible(false);
                  setVisibleReplies((prev) => ({
                    ...prev,
                    ...Object.keys(prev).reduce(
                      (acc, key) => ({ ...acc, [key]: true }),
                      {}
                    ),
                  }));
                }
              }}
              cancelText={localStrings.Public.Cancel}
              okText={localStrings.Public.Reply}
              okButtonProps={{
                disabled: !isContentLengthValid(replyContent) || isPosting,
                style: {
                  backgroundColor: isContentLengthValid(replyContent) && !isPosting ? brandPrimary : darkGray,
                  color: backgroundColor,
                  border: "none",
                },
              }}
              cancelButtonProps={{
                style: {
                  backgroundColor: menuItem,
                  color: brandPrimary,
                  border: `1px solid ${borderColor}`,
                },
              }}
              styles={{
                body: { padding: "16px", backgroundColor: backgroundColor },
                header: { backgroundColor: backgroundColor, color: brandPrimary },
                content: { backgroundColor: backgroundColor },
              }}
            >
              <div className="relative">
                <textarea
                  className="comment-input w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={replyContent}
                  placeholder={`${localStrings.Public.ReplyClick}`}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={isPosting}
                  style={{
                    backgroundColor: backgroundAddPost,
                    color: brandPrimary,
                    border: `1px solid ${borderColor}`,
                    width: "100%",
                  }}
                />
                <Text
                  type={replyContent.length > 500 ? "danger" : "secondary"}
                  style={{ float: "right", marginTop: 4, color: replyContent.length > 500 ? borderBirth : darkGray }}
                >
                  {replyContent.length}/{localStrings.PostDetails.CommentLimit}
                </Text>
                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker((prev) => ({ ...prev, reply: !prev.reply }))
                  }
                  className="absolute right-3 top-4 text-lg rounded-full p-1"
                  disabled={isPosting}
                  style={{
                    backgroundColor: lightGray,
                    color: brandPrimary,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkGray)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = lightGray)}
                >
                  😊
                </button>
              </div>
              {showEmojiPicker.reply && (
                <div
                  ref={emojiPickerRefReply}
                  className="absolute left-5 z-10 rounded-lg shadow-md"
                  style={{ backgroundColor: backgroundColor, border: `1px solid ${borderColor}` }}
                >
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => handleEmojiClickReply(emojiObject)}
                    width={400}
                    height={320}
                  />
                </div>
              )}
              {isPosting && (
                <div className="text-center mt-4">
                  <Spin tip="Đang đăng bình luận..." />
                </div>
              )}
            </Modal>
          )}
          {isEditModalVisible && (
            <Modal
              title={`${localStrings.PostDetails.EditComment}`}
              centered
              visible={isEditModalVisible}
              onCancel={() => setEditModalVisible(false)}
              onOk={() => {
                if (isContentLengthValid(editCommentContent)) {
                  handleUpdate(editCommnetId, editCommentContent, replyToCommentId || "");
                  setEditModalVisible(false);
                }
              }}
              okButtonProps={{
                disabled: !isContentLengthValid(editCommentContent),
                style: {
                  backgroundColor: isContentLengthValid(editCommentContent) ? brandPrimary : darkGray,
                  color: backgroundColor,
                  border: "none",
                },
              }}
              cancelButtonProps={{
                style: {
                  backgroundColor: menuItem,
                  color: brandPrimary,
                  border: `1px solid ${borderColor}`,
                },
              }}
              styles={{
                body: { padding: "16px", backgroundColor: backgroundColor },
                header: { backgroundColor: backgroundColor, color: brandPrimary },
                content: { backgroundColor: backgroundColor },
              }}
            >
              <div className="relative">
                <textarea
                  className="comment-input w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={editCommentContent}
                  onChange={(e) => setEditCommentContent(e.target.value)}
                  style={{
                    backgroundColor: backgroundAddPost,
                    color: brandPrimary,
                    border: `1px solid ${borderColor}`,
                    width: "100%",
                  }}
                />
                <Text
                  type={editCommentContent.length > 500 ? "danger" : "secondary"}
                  style={{
                    float: "right",
                    marginTop: 4,
                    color: editCommentContent.length > 500 ? borderBirth : darkGray,
                  }}
                >
                  {editCommentContent.length}/{localStrings.PostDetails.CommentLimit}
                </Text>
                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker((prev) => ({
                      ...prev,
                      editCommet: !prev.editCommet,
                    }))
                  }
                  className="absolute right-3 top-4 text-lg rounded-full p-1"
                  style={{
                    backgroundColor: lightGray,
                    color: brandPrimary,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkGray)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = lightGray)}
                >
                  😊
                </button>
              </div>
              {showEmojiPicker.editCommet && (
                <div
                  ref={emojiPickerRefEditComment}
                  className="absolute left-5 z-10 rounded-lg shadow-md"
                  style={{ backgroundColor: backgroundColor, border: `1px solid ${borderColor}` }}
                >
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => handleEmojiClickEdit(emojiObject)}
                    width={400}
                    height={320}
                  />
                </div>
              )}
            </Modal>
          )}
          <Modal
            centered
            title={localStrings.Public.ReportFriend}
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={null}
            styles={{
              body: { padding: "16px", backgroundColor: backgroundColor },
              header: { backgroundColor: backgroundColor, color: brandPrimary },
              content: { backgroundColor: backgroundColor },
            }}
          >
            <ReportScreen commentId={currentCommentId} setShowModal={setShowModal} />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsScreen;