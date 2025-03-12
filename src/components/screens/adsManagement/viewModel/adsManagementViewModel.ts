import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { GetUsersPostsRequestModel } from '@/api/features/post/models/GetUsersPostsModel';
import { defaultPostRepo, PostRepo } from '@/api/features/post/PostRepo';
import { useAuth } from '@/context/auth/useAuth';
import {
  AdvertisePostRequestModel,
  AdvertisePostResponseModel,
} from '@/api/features/post/models/AdvertisePostModel';
import { DateTransfer, getDayDiff } from '@/utils/helper/DateTransfer';

// Define a type for the mapped ad to ensure type consistency
interface MappedAd extends AdvertisePostResponseModel {
  post_id: string | undefined;
  status: string | undefined;
  start_date: string;
  end_date: string;
  day_remaining: number;
  resultsData: number[];
  reachData: number[];
  impressionsData: number[];
  labels: string[];
}

const useAdsManagement = (repo: PostRepo = defaultPostRepo) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [ads, setAds] = useState<MappedAd[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [postDetails, setPostDetails] = useState<Record<string, AdvertisePostResponseModel>>({});
  const [isLoadingPostDetails, setIsLoadingPostDetails] = useState<boolean>(false);

  const fetchAds = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const request: GetUsersPostsRequestModel = {
        user_id: user.id,
        sort_by: 'created_at',
        isDescending: true,
        limit: 10,
        page,
        is_advertisement: true,
      };

      const res = await repo.getAdvertisementPosts(request);
      if (!res?.data) {
        setError('Không thể lấy dữ liệu quảng cáo');
        return;
      }

      const filteredAds = res.data.filter((item) => item.is_advertisement === true);
      const mappedAds: MappedAd[] = filteredAds.map((item: AdvertisePostResponseModel) => {
        let startDate = item.start_date;
        let endDate = item.end_date;
        let daysRemaining = item.day_remaining;

        // Fallback to created_at if start_date is missing
        if (!startDate && item.created_at) {
          const createdAt = dayjs(item.created_at);
          if (createdAt.isValid()) {
            startDate = DateTransfer(item.created_at); // Format: DD/MM/YYYY
          }
        }

        // Simulate end_date as 7 days from start_date if missing
        if (!endDate && startDate) {
          const start = dayjs(startDate, 'DD/MM/YYYY');
          if (start.isValid()) {
            const endAt = start.add(7, 'day');
            endDate = DateTransfer(endAt.toDate());
            daysRemaining = getDayDiff(endAt.toDate());
          }
        }

        // Recalculate daysRemaining if end_date exists but day_remaining is undefined
        if (endDate && daysRemaining === undefined) {
          const end = dayjs(endDate, 'DD/MM/YYYY');
          if (end.isValid()) {
            daysRemaining = Math.max(getDayDiff(end.toDate()), 0);
          }
        }

        // Mock chart data if not provided
        const resultsData = item.resultsData || Array.from({ length: 7 }, () => Math.floor(Math.random() * 50));
        const reachData = item.reachData || Array.from({ length: 7 }, () => Math.floor(Math.random() * 200));
        const impressionsData = item.impressionsData || Array.from({ length: 7 }, () => Math.floor(Math.random() * 500));
        const labels = item.labels || Array.from({ length: 7 }, (_, i) =>
          DateTransfer(dayjs().subtract(i, 'day').toDate())
        ).reverse();

        return {
          ...item,
          post_id: item.id, // Ensure post_id consistency
          status: item.status?.toString(), // Convert status to string explicitly
          start_date: startDate || 'N/A',
          end_date: endDate || 'N/A',
          day_remaining: daysRemaining ?? 0,
          resultsData,
          reachData,
          impressionsData,
          labels,
          is_advertisement: true, // Since we filtered for this
        };
      });

      setAds((prevAds) => (page === 1 ? mappedAds : [...prevAds, ...mappedAds]));

      // Fetch post details for new ads
      setIsLoadingPostDetails(true);
      const postIdsToFetch = mappedAds
        .map((ad) => ad.post_id)
        .filter((postId): postId is string => !!postId && !postDetails[postId]);

      if (postIdsToFetch.length > 0) {
        const newPostDetails: Record<string, AdvertisePostResponseModel> = {};
        await Promise.all(
          postIdsToFetch.map(async (postId) => {
            const post = await repo.getPostById(postId);
            if (post?.data?.is_advertisement) {
              newPostDetails[postId] = post.data as AdvertisePostResponseModel;
            }
          })
        );
        setPostDetails((prev) => ({ ...prev, ...newPostDetails }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setLoading(false);
      setIsLoadingPostDetails(false);
    }
  }, [user?.id, page, repo, postDetails]);

  const loadMoreAds = () => setPage((prev) => prev + 1);

  const advertisePost = async (params: AdvertisePostRequestModel) => {
    try {
      const res = await repo.advertisePost(params);
      if (res?.data) {
        setPage(1); // Reset to first page
        await fetchAds(); // Refresh ads list
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo quảng cáo');
    }
  };

  useEffect(() => {
    if (user?.id) fetchAds();
  }, [fetchAds, user?.id]);

  return {
    loading,
    ads,
    error,
    advertisePost,
    fetchAds,
    loadMoreAds,
    postDetails,
    isLoadingPostDetails,
  };
};

export default useAdsManagement;