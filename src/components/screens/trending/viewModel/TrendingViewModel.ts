import { PostResponseModel } from "@/api/features/post/models/PostResponseModel";
import { PostRepo } from "@/api/features/post/PostRepo";
import { BaseApiResponseModel } from "@/api/baseApiResponseModel/baseApiResponseModel";
import { useState } from "react";
import { useAuth } from "@/context/auth/useAuth";
import { message } from "antd";
import { GetUsersPostsRequestModel } from "@/api/features/post/models/GetUsersPostsModel";

const TrendingViewModel = (repo: PostRepo) => {
  const [trendingPosts, setTrendingPosts] = useState<PostResponseModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { localStrings } = useAuth();
  const limit = 20;

  const fetchTrendingPosts = async (newPage: number = 1) => {
    try {
      setLoading(true);
      const requestData: GetUsersPostsRequestModel = {
        page: newPage,
        limit: limit,
      };
      const response: BaseApiResponseModel<PostResponseModel[]> =
        await repo.getPostsTrending(requestData);

      if (!response.error) {
        const newPosts = response.data || [];
        if (newPage === 1) {
          setTrendingPosts(newPosts);
        } else {
          setTrendingPosts((prevPosts) => [...prevPosts, ...newPosts]);
        }
        const { page: currentPage, limit: currentLimit, total: totalRecords } =
          response.paging || { page: 1, limit, total: newPosts.length };
        setPage(currentPage);
        setHasMore(currentPage * currentLimit < totalRecords);
      } else {
        message.error(localStrings.Public.ErrorLoading);
      }
    } catch (error: any) {
      console.error("Error fetching trending posts:", error);
      message.error(localStrings.Public.ErrorLoading);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTrendingPosts = async () => {
    if (!hasMore || loading) return;
    await fetchTrendingPosts(page + 1);
  };

  return {
    trendingPosts,
    loading,
    fetchTrendingPosts,
    loadMoreTrendingPosts,
    hasMore,
    setTrendingPosts,
  };
};

export default TrendingViewModel;