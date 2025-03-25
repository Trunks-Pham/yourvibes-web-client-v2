import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { GetUsersPostsRequestModel } from '@/api/features/post/models/GetUsersPostsModel';
import { defaultPostRepo, PostRepo } from '@/api/features/post/PostRepo';
import { useAuth } from '@/context/auth/useAuth';
import {
  AdvertisePostRequestModel,
  AdvertisePostResponseModel,
  BillModel,
  StatisticEntry,
} from '@/api/features/post/models/AdvertisePostModel';
import { DateTransfer, getDayDiff } from '@/utils/helper/DateTransfer';

interface MappedAd extends AdvertisePostResponseModel {
  post_id: string | undefined;
  status: string | undefined;
  start_date: string;
  end_date: string;
  day_remaining: number;
  resultsData: number[]; // clicks
  reachData: number[]; // reach
  impressionsData: number[]; // impressions
  labels: string[]; // aggregation_date
  bill: BillModel | undefined;
  isActive: boolean;
  status_action: string;
  total_reach?: number;
  total_clicks?: number;
  total_impression?: number;
}

const useAdsManagement = (repo: PostRepo = defaultPostRepo) => {
  const { user, localStrings } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [ads, setAds] = useState<MappedAd[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [postDetails, setPostDetails] = useState<Record<string, AdvertisePostResponseModel>>({});
  const [isLoadingPostDetails, setIsLoadingPostDetails] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const isAdActive = (ad: AdvertisePostResponseModel): boolean => {
    if (ad.status !== 'success' || ad.bill?.status !== 'success') return false;
    const now = dayjs();
    const end = dayjs(ad.end_date);
    return end.isValid() && now.isBefore(end, 'day');
  };

  const getStatusAction = (ad: AdvertisePostResponseModel): string => {
    if (ad.status !== 'success' || ad.bill?.status !== 'success') {
      return localStrings.Ads.Pending;
    }
    return isAdActive(ad) ? localStrings.Ads.Active : localStrings.Ads.Completed;
  };

  const fetchAdStatistics = useCallback(async (advertiseId: string): Promise<AdvertisePostResponseModel | null> => {
    try {
      const response = await repo.getAdvertiseStatistics(advertiseId);
      return response?.data || null;
    } catch (err) {
      console.error(`Error fetching statistics for advertiseId ${advertiseId}:`, err);
      return null;
    }
  }, [repo]);

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
      };

      const res = await repo.getAdvertisementPosts(request);
      if (!res?.data) {
        setError('Failed to fetch advertisement data');
        setHasMore(false);
        return;
      }

      const filteredAds: AdvertisePostResponseModel[] = (res.data as AdvertisePostResponseModel[]).filter(
        (item) => Number(item.is_advertisement) === 1 || Number(item.is_advertisement) === 2
      );
      if (filteredAds.length === 0 && page > 1) {
        setHasMore(false);
      }

      const mappedAds: MappedAd[] = await Promise.all(
        filteredAds.map(async (item: AdvertisePostResponseModel) => {
          const now = dayjs();
          let startDate = item.start_date;
          let endDate = item.end_date;
          let daysRemaining = item.day_remaining;

          // Xử lý start_date
          if (!startDate || !dayjs(startDate).isValid()) {
            startDate = now.format('DD/MM/YYYY');
          } else {
            startDate = DateTransfer(new Date(startDate));
          }

          // Xử lý end_date và day_remaining
          if (!endDate || !dayjs(endDate).isValid()) {
            endDate = dayjs(startDate, 'DD/MM/YYYY').add(7, 'day').format('DD/MM/YYYY');
            daysRemaining = 7;
          } else {
            endDate = DateTransfer(new Date(endDate));
            daysRemaining = Math.max(getDayDiff(new Date(endDate), new Date()), 0);
          }

          // Lấy dữ liệu thống kê
          const stats = item.id ? await fetchAdStatistics(item.id) : null;
          const statistics: StatisticEntry[] = stats?.statistics || item.statistics || [];

          const resultsData = statistics.map((stat: StatisticEntry) => stat.clicks || 0);
          const reachData = statistics.map((stat: StatisticEntry) => stat.reach || 0);
          const impressionsData = statistics.map((stat: StatisticEntry) => stat.impression || 0);
          const labels = statistics.map((stat: StatisticEntry) =>
            dayjs(stat.aggregation_date).format('DD/MM')
          );

          // Xử lý trạng thái
          let adStatus = item.status?.toString() || 'N/A';
          if (item.bill?.status) {
            adStatus = item.bill.status;
          }

          return {
            ...item,
            post_id: item.post_id || item.id,
            status: adStatus,
            start_date: startDate,
            end_date: endDate,
            day_remaining: daysRemaining ?? 0,
            resultsData,
            reachData,
            impressionsData,
            labels,
            bill: item.bill,
            isActive: isAdActive(item),
            status_action: getStatusAction(item),
            total_reach: stats?.total_reach || item.total_reach || 0,
            total_clicks: stats?.total_clicks || item.total_clicks || 0,
            total_impression: stats?.total_impression || item.total_impression || 0,
          };
        })
      );

      setAds((prevAds) => (page === 1 ? mappedAds : [...prevAds, ...mappedAds]));
      setHasMore(filteredAds.length === 10);

      // Lấy chi tiết bài viết
      setIsLoadingPostDetails(true);
      const postIdsToFetch = mappedAds
        .map((ad) => ad.post_id)
        .filter((postId): postId is string => !!postId && !postDetails[postId]);

      if (postIdsToFetch.length > 0) {
        const newPostDetails: Record<string, AdvertisePostResponseModel> = {};
        await Promise.all(
          postIdsToFetch.map(async (postId) => {
            const post = await repo.getPostById(postId);
            if (post?.data && (post.data.is_advertisement === 1 || post.data.is_advertisement === 2)) {
              newPostDetails[postId] = post.data as AdvertisePostResponseModel;
            }
          })
        );
        setPostDetails((prev) => ({ ...prev, ...newPostDetails }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsLoadingPostDetails(false);
    }
  }, [user?.id, page, repo, postDetails, localStrings.Ads]);

  const loadMoreAds = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const advertisePost = async (params: AdvertisePostRequestModel) => {
    try {
      const res = await repo.advertisePost(params);
      if (res?.data) {
        setPage(1);
        await fetchAds();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating advertisement');
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
    hasMore,
  };
};

export default useAdsManagement;