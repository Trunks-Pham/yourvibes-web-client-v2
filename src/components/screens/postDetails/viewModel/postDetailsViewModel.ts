import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth/useAuth";
import { message } from "antd";
import { CommentsResponseModel } from "@/api/features/comment/models/CommentResponseModel";
import { defaultCommentRepo } from "@/api/features/comment/CommentRepo";
import { CreateCommentsRequestModel } from "@/api/features/comment/models/CreateCommentsModel";
import { defaultLikeCommentRepo } from "@/api/features/likeComment/LikeCommentRepo";
import { defaultPostRepo, PostRepo } from "@/api/features/post/PostRepo";
import { LikeUsersModel } from "@/api/features/post/models/LikeUsersModel";
import { Modal } from "antd";

const PostDetailsViewModel = (postId: string, repo: PostRepo) => {
  const [comments, setComments] = useState<CommentsResponseModel[]>([]);
  const [replyMap, setReplyMap] = useState<{ [key: string]: CommentsResponseModel[] }>({});
  const [likeCount, setLikeCount] = useState<{ [key: string]: number }>({});
  const [isLiked, setIsLiked] = useState<{ [key: string]: boolean }>({});
  const [heartColors, setHeartColors] = useState<{ [key: string]: string }>({});
  const [likedComment, setLikedComment] = useState({ is_liked: false });
  const [newComment, setNewComment] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyToReplyId, setReplyToReplyId] = useState<string | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [currentCommentId, setCurrentCommentId] = useState("");
  const [userLikePost, setUserLikePost] = useState<LikeUsersModel[]>([]);
  const { user, localStrings } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [visibleReplies, setVisibleReplies] = useState<{ [key: string]: boolean }>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false); // Thêm trạng thái isPosting

  const toggleRepliesVisibility = (commentId: string) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReplyClick = (commentId: string, isReply: boolean = false) => {
    if (isReply) {
      setReplyToReplyId(commentId);
    } else {
      setReplyToCommentId(commentId);
    }
    setReplyContent("");
    fetchReplies(postId || "", commentId);
  };

  const handleShowEditModal = (commentId: string, content: string) => {
    setEditCommentContent(content);
    setCurrentCommentId(commentId);
    setEditModalVisible(true);
  };

  const handleOutsideClick = () => {
    if (replyToCommentId || replyToReplyId) {
      setReplyToCommentId(null);
      setReplyToReplyId(null);
      setReplyContent("");
    }
  };

  const fetchComments = async (pageNumber: number = 1, append: boolean = false) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const response = await defaultCommentRepo.getComments({
        PostId: postId,
        page: pageNumber,
        limit: 10,
      });
      if (response && response?.data) {
        const newComments = response.data;
        if (newComments.length < 10) {
          setHasMore(false);
        }
        setComments((prev) => (append ? [...prev, ...newComments] : newComments));
        const initialLikeCount: { [key: string]: number } = {};
        const initialIsLiked: { [key: string]: boolean } = {};
        const initialHeartColors: { [key: string]: string } = {};
        newComments.forEach((comment) => {
          initialLikeCount[comment.id] = comment.like_count || 0;
          initialIsLiked[comment.id] = comment.is_liked || false;
          initialHeartColors[comment.id] = comment.is_liked ? "red" : "gray";
        });
        setLikeCount((prev) => ({ ...prev, ...initialLikeCount }));
        setIsLiked((prev) => ({ ...prev, ...initialIsLiked }));
        setHeartColors((prev) => ({ ...prev, ...initialHeartColors }));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      message.error(localStrings.PostDetails.CommentFailed);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreComments = () => {
    setPage((prev) => {
      const nextPage = prev + 1;
      fetchComments(nextPage, true);
      return nextPage;
    });
  };

  const fetchReplies = async (postId: string, parentId: string) => {
    try {
      const replies = await defaultCommentRepo.getReplies(postId, parentId);
      if (replies && replies.data) {
        setReplyMap((prevReplyMap) => ({
          ...prevReplyMap,
          [parentId]: replies.data,
        }));
        const replyLikeCount: { [key: string]: number } = {};
        const replyIsLiked: { [key: string]: boolean } = {};
        const replyHeartColors: { [key: string]: string } = {};
        replies.data.forEach((reply) => {
          replyLikeCount[reply.id] = reply.like_count || 0;
          replyIsLiked[reply.id] = reply.is_liked || false;
          replyHeartColors[reply.id] = reply.is_liked ? "red" : "gray";
        });
        setLikeCount((prev) => ({ ...prev, ...replyLikeCount }));
        setIsLiked((prev) => ({ ...prev, ...replyIsLiked }));
        setHeartColors((prev) => ({ ...prev, ...replyHeartColors }));
      }
    } catch (error) {
      message.error(localStrings.PostDetails.CommentFailed);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, []);

  const handleLike = async (commentId: string) => {
    const currentIsLiked = isLiked[commentId] ?? false;
    const newIsLiked = !currentIsLiked;
    try {
      const response = await defaultLikeCommentRepo.postLikeComment({
        commentId,
        isLike: newIsLiked,
      });
      if (response && response.data) {
        const likeCommentResponse = Array.isArray(response.data) && response.data[0] ? response.data[0] : null;
        if (likeCommentResponse && typeof likeCommentResponse.like_count === "number") {
          const newLikeCount = likeCommentResponse.like_count;
          setIsLiked((prev) => ({ ...prev, [commentId]: newIsLiked }));
          setLikeCount((prev) => ({ ...prev, [commentId]: newLikeCount }));
          setHeartColors((prev) => ({ ...prev, [commentId]: newIsLiked ? "red" : "gray" }));
          setLikedComment({ is_liked: newIsLiked });
        } else {
          setLikeCount((prev) => ({
            ...prev,
            [commentId]: newIsLiked ? (prev[commentId] || 0) + 1 : (prev[commentId] || 0) - 1,
          }));
          setIsLiked((prev) => ({ ...prev, [commentId]: newIsLiked }));
          setHeartColors((prev) => ({ ...prev, [commentId]: newIsLiked ? "red" : "gray" }));
          setLikedComment({ is_liked: newIsLiked });
        }
      } else {
        message.error("Failed to like/unlike comment");
      }
    } catch (error) {
      message.error("Failed to like/unlike comment");
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!currentCommentId || !editCommentContent) {
      return;
    }
    await handleUpdate(currentCommentId, editCommentContent, commentId);
    setEditModalVisible(false);
    setEditCommentContent("");
    setCurrentCommentId("");
  };

  const handleUpdate = async (
    commentId: string,
    updatedContent: string,
    parentId: string,
    isReply = false
  ) => {
    try {
      const updateCommentData = {
        comments_id: commentId,
        content: updatedContent,
      };
      const response = await defaultCommentRepo.updateComment(commentId, updateCommentData);
      if (response && response.data) {
        if (isReply) {
          setReplyMap((prevReplyMap) => {
            const updatedReplies = prevReplyMap[parentId].map((reply) =>
              reply.id === commentId ? { ...reply, content: updatedContent } : reply
            );
            return { ...prevReplyMap, [parentId]: updatedReplies };
          });
          setComments((prev) => [...prev, { ...response.data, replies: [] }]);
        } else {
          const updatedComments = comments.map((comment) =>
            comment.id === commentId ? { ...comment, content: updatedContent } : comment
          );
          setComments(updatedComments);
        }
        fetchComments(1);
      }
    } catch (error) {}
  };

  const handleDelete = async (commentId: string) => {
    Modal.confirm({
      title: `${localStrings.PostDetails.DeleteComment}`,
      content: "",
      okText: `${localStrings.PostDetails.Yes}`,
      cancelText: `${localStrings.PostDetails.No}`,
      onCancel: () => {},
      onOk: async () => {
        try {
          await defaultCommentRepo.deleteComment(commentId);
          const isTopLevelComment = comments.some((c) => c.id === commentId);
          if (isTopLevelComment) {
            setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
          } else {
            const parentId = Object.keys(replyMap).find((key) =>
              replyMap[key].some((reply) => reply.id === commentId)
            );
            if (parentId) {
              setReplyMap((prevReplyMap) => ({
                ...prevReplyMap,
                [parentId]: prevReplyMap[parentId].filter((reply) => reply.id !== commentId),
              }));
              await fetchReplies(postId || "", parentId);
            }
          }
          await fetchComments(1);
          message.success({ content: localStrings.PostDetails.DeleteCommentSusesfully });
        } catch (error) {
          message.error({ content: localStrings.PostDetails.DeleteCommentFailed });
        }
      },
    });
  };

  const handleAddComment = async (comment: string) => {
    if (comment.trim()) {
      const commentData: CreateCommentsRequestModel = {
        post_id: postId,
        content: comment,
      };
      setIsPosting(true); // Bắt đầu hiển thị loader
      try {
        const response = await defaultCommentRepo.createComment(commentData);
        if (!response.error) {
          const newComment = { ...response.data, replies: [] };
          setComments((prev) => [...prev, newComment]);
          fetchComments(1);
          message.success({ content: localStrings.PostDetails.CommentSuccess });
        } else {
          message.error({ content: localStrings.PostDetails.CommentFailed });
        }
      } catch (error) {
        message.error({ content: localStrings.PostDetails.CommentFailed });
      } finally {
        setNewComment("");
        setIsPosting(false); // Ẩn loader
      }
    }
  };

  const handleAddReply = async (comment: string, id: string) => {
    if (comment.trim()) {
      const parentId = replyToReplyId || replyToCommentId;
      const commentData: CreateCommentsRequestModel = {
        post_id: postId,
        content: comment,
        parent_id: parentId,
      };
      setIsPosting(true); // Bắt đầu hiển thị loader
      try {
        const response = await defaultCommentRepo.createComment(commentData);
        if (!response.error) {
          const newComment = { ...response.data, replies: [] };
          setComments((prev) => [...prev]);
          const updatedReplies = [...(replyMap[parentId || ""] || []), newComment];
          setReplyMap((prevReplyMap) => ({
            ...prevReplyMap,
            [parentId || ""]: updatedReplies,
          }));
          fetchComments(1);
          fetchReplies(postId || "", parentId || "");
          message.success({ content: localStrings.PostDetails.ReplySuccess });
        } else {
          message.error({ content: localStrings.PostDetails.ReplyFailed });
        }
      } catch (error) {
        message.error({ content: localStrings.PostDetails.ReplyFailed });
      } finally {
        setNewComment("");
        setReplyToReplyId(null);
        setIsPosting(false); // Ẩn loader
      }
    }
  };

  const fetchUserLikePosts = async (postId: string) => {
    const response = await defaultPostRepo.getPostLikes({
      postId: postId,
      page: 1,
      limit: 10,
    });
    setUserLikePost(response?.data);
  };

  useEffect(() => {
    fetchUserLikePosts(postId);
  }, [postId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (replyToCommentId) {
      setReplyContent(e.target.value);
    } else {
      setNewComment(e.target.value);
    }
  };

  const handlePostAction = () => {
    if (replyToCommentId) {
      handleAddReply(replyContent, replyToCommentId);
      setReplyToCommentId(null);
      setReplyContent("");
    } else {
      handleAddComment(newComment);
      setNewComment("");
    }
  };

  return {
    comments,
    replyMap,
    likeCount,
    newComment,
    isEditModalVisible,
    editCommentContent,
    handleLike,
    handleDelete,
    handleEditComment,
    setEditCommentContent,
    replyContent,
    setReplyContent,
    handlePostAction,
    handleTextChange,
    setReplyToCommentId,
    setReplyToReplyId,
    replyToCommentId,
    replyToReplyId,
    fetchReplies,
    setEditModalVisible,
    handleUpdate,
    toggleRepliesVisibility,
    handleReplyClick,
    handleShowEditModal,
    handleOutsideClick,
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
    isPosting, // Trả về isPosting
  };
};

export default PostDetailsViewModel;