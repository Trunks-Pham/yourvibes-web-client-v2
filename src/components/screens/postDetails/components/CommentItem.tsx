import React, { useRef, useState } from "react";
import { Avatar, Col, Row } from "antd";
import { FaEdit, FaHeart, FaReply, FaTrash, FaFlag } from "react-icons/fa";
import { useAuth } from "@/context/auth/useAuth";
import useColor from "@/hooks/useColor";

interface CommentItemProps {
  comment: any;
  replyMap: any;
  heartColors: any;
  handleLike: (id: string) => Promise<void>;
  handleDelete: (id: string) => void;
  handleShowEditModal: (id: string, content: string) => void;
  handleReplyClick: (id: string) => void;
  fetchReplies: (postId: string, commentId: string) => void;
  fetchComments: () => void;
  toggleRepliesVisibility: (id: string) => void;
  visibleReplies: any;
  setLikedComment: (liked: any) => void;
  likedComment: any;
  reportComment: (id: string) => void;
  setReplyModalVisible: (visible: boolean) => void;
  setSelectedCommentId: (id: string) => void;
  postId: string;
  likeCount: { [key: string]: number };
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replyMap,
  heartColors,
  handleLike,
  handleDelete,
  handleShowEditModal,
  handleReplyClick,
  fetchReplies,
  fetchComments,
  toggleRepliesVisibility,
  visibleReplies,
  setLikedComment,
  likedComment,
  reportComment,
  setReplyModalVisible,
  setSelectedCommentId,
  postId,
  likeCount,
}) => {
  const { user } = useAuth();
  const userId = user?.id;
  const {
    brandPrimary,
    brandPrimaryTap,
    backgroundAddPost,
    borderColor,
  } = useColor();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const handleClickOutside: React.MouseEventHandler = (event) => {
    if (
      showEmojiPicker &&
      emojiPickerRef.current &&
      !(emojiPickerRef.current as HTMLElement).contains(event.target as Node)
    ) {
      setShowEmojiPicker(false);
    }
  };

  const { localStrings } = useAuth();

  return (
    <div
      className="comment-item p-4 rounded-lg shadow-sm text-sm hover:shadow-md"
      style={{ backgroundColor: backgroundAddPost }}
    >
      <div className="comment-header flex items-center mb-3">
        <Avatar src={comment.user.avatar_url} size={{ xs: 40, sm: 40, md: 40, lg: 40, xl: 40, xxl: 40 }} />
        <div className="ml-3">
          <p className="font-semibold" style={{ color: brandPrimary }}>
            {comment.user.family_name} {comment.user.name}
          </p>
          <p className="text-xs" style={{ color: brandPrimaryTap }}>
            {new Date(comment.created_at).toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}
          </p>
        </div>
      </div>
      <div className="comment-content">
        <p className="mb-3" style={{ color: brandPrimary }}>
          {comment.content}
        </p>
        <div className="comment-actions flex space-x-4 text-xs">
          <Row>
            <Col
              span={4}
              className="hover:cursor-pointer"
              style={{ display: "flex", alignItems: "center" }}
            >
              <FaHeart
                size={16}
                color={heartColors[comment.id] || brandPrimary}
                style={{
                  stroke: brandPrimary,
                  strokeWidth: 2,
                  marginRight: 5,
                }}
                onClick={() => handleLike(comment.id)}
              />
              {likeCount[comment.id] > 0 && (
                <span
                  style={{
                    color: brandPrimary,
                    fontSize: 12,
                    opacity: 0.5,
                  }}
                >
                  {likeCount[comment.id]}
                </span>
              )}

            </Col>
            {userId === comment.user?.id ? (
              <Col span={4} className="hover:cursor-pointer">
                <FaTrash
                  size={16}
                  color={"gray"}
                  style={{
                    stroke: brandPrimary,
                    strokeWidth: 2,
                    marginRight: 50,
                  }}
                  onClick={() => handleDelete(comment.id)}
                />
              </Col>
            ) : null}
            <Col span={4} className="hover:cursor-pointer">
              {userId === comment.user?.id ? (
                <FaEdit
                  size={16}
                  color={"gray"}
                  style={{
                    stroke: brandPrimary,
                    strokeWidth: 2,
                    marginRight: 50,
                  }}
                  onClick={() => {
                    handleShowEditModal(comment.id, comment.content);
                  }}
                />
              ) : (
                <FaFlag
                  size={16}
                  color={"gray"}
                  style={{
                    stroke: brandPrimary,
                    strokeWidth: 2,
                    marginRight: 50,
                  }}
                  onClick={() => reportComment(comment.id)}
                />
              )}
            </Col>
            <Col span={4} className="hover:cursor-pointer">
              <FaReply
                size={16}
                color={"gray"}
                style={{
                  stroke: brandPrimary,
                  strokeWidth: 2,
                  marginRight: 50,
                }}
                onClick={() => {
                  setSelectedCommentId(comment.id);
                  handleReplyClick(comment.id);
                  setReplyModalVisible(true);
                }}
              />
            </Col>
          </Row>
        </div>
      </div>
      <div
        onClick={handleClickOutside}
        className="replies pl-6 mt-3 border-l-2"
        style={{ borderColor: borderColor }}
      >
        {replyMap[comment.id]?.length > 0 && (
          <button
            onClick={() => {
              toggleRepliesVisibility(comment.id);
              if (!visibleReplies[comment.id] && (!replyMap[comment.id] || replyMap[comment.id].length === 0)) {
                fetchReplies(postId, comment.id);
              }
            }}
            className="show-replies-btn text-xs mb-2"
            style={{ color: "gray" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = brandPrimaryTap)}
            onMouseLeave={(e) => (e.currentTarget.style.color = brandPrimary)}
          >
            {visibleReplies[comment.id]
              ? `${localStrings.PostDetails.HideReplies}`
              : `${localStrings.PostDetails.ViewReplies}`}
          </button>
        )}
        {visibleReplies[comment.id] &&
          replyMap[comment.id]?.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replyMap={replyMap}
              heartColors={heartColors}
              handleLike={handleLike}
              handleDelete={handleDelete}
              handleShowEditModal={handleShowEditModal}
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
              postId={postId}
              likeCount={{ [reply.id]: likeCount[reply.id] }}
            />
          ))}
      </div>
    </div>
  );
};

export default CommentItem;