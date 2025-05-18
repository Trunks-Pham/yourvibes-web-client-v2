import { useState, useEffect, useCallback, useMemo } from "react";
import dayjs from "dayjs";
import { GetUsersPostsRequestModel } from "@/api/features/post/models/GetUsersPostsModel";
import { defaultPostRepo, PostRepo } from "@/api/features/post/PostRepo";
import { useAuth } from "@/context/auth/useAuth";
import {
  AdvertisePostRequestModel,
  AdvertisePostResponseModel,
  BillModel,
  StatisticEntry,
} from "@/api/features/post/models/AdvertisePostModel";
import { DateTransfer } from "@/utils/helper/DateTransfer";

interface CacheEntry {
  data: any;
  timestamp: number;
}
const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  const [loadingStatistics, setLoadingStatistics] = useState<boolean>(false);
  const [ads, setAds] = useState<MappedAd[]>([]);
  const [groupedAds, setGroupedAds] = useState<Record<string, MappedAd[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [postDetails, setPostDetails] = useState<Record<string, AdvertisePostResponseModel>>({});
  const [isLoadingPostDetails, setIsLoadingPostDetails] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const isAdActive = useCallback((ad: AdvertisePostResponseModel): boolean => {
    if (ad.status !== "success" || ad.bill?.status !== true) return false;
    const now = dayjs();
    const end = dayjs(ad.end_date);
    return end.isValid() && now.isBefore(end, "day");
  }, []);

  const getStatusAction = useCallback(
    (ad: AdvertisePostResponseModel): string => {
      if (ad.status !== "success" || ad.bill?.status !== true) {
        return localStrings.Ads.Pending;
      }
      return isAdActive(ad) ? localStrings.Ads.Active : localStrings.Ads.Completed;
    },
    [isAdActive, localStrings.Ads]
  );

  const fetchAdStatistics = useCallback(
    async (advertiseId: string): Promise<AdvertisePostResponseModel | null> => {
      const cacheKey = `stats_${advertiseId}`;
      const cached = cache[cacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      try {
        const response = await repo.getAdvertiseStatistics(advertiseId);
        const data = response?.data || null;
        cache[cacheKey] = { data, timestamp: Date.now() };
        return data;
      } catch (err) {
        console.error(`Error fetching statistics for advertiseId ${advertiseId}:`, err);
        return null;
      }
    },
    [repo]
  );

  const preloadStatistics = useCallback(
    async (advertiseId: string) => {
      setLoadingStatistics(true);
      const cacheKey = `stats_${advertiseId}`;
      const cached = cache[cacheKey];

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setLoadingStatistics(false);
        return cached.data;
      }

      try {
        const data = await fetchAdStatistics(advertiseId);
        if (data) {
          setAds((prevAds) =>
            prevAds.map((ad) =>
              ad.id === advertiseId
                ? {
                    ...ad,
                    statistics: data.statistics || [],
                    total_reach: data.total_reach || ad.total_reach,
                    total_clicks: data.total_clicks || ad.total_clicks,
                    total_impression: data.total_impression || ad.total_impression,
                    resultsData: data.statistics?.map((stat: StatisticEntry) => stat.clicks || 0) || ad.resultsData,
                    reachData: data.statistics?.map((stat: StatisticEntry) => stat.reach || 0) || ad.reachData,
                    impressionsData:
                      data.statistics?.map((stat: StatisticEntry) => stat.impression || 0) || ad.impressionsData,
                    labels:
                      data.statistics?.map((stat: StatisticEntry) =>
                        dayjs(stat.aggregation_date).format("HH:mm:ss DD/MM")
                      ) || ad.labels,
                  }
                : ad
            )
          );

          setGroupedAds((prevGrouped) => {
            const newGrouped = { ...prevGrouped };
            Object.keys(newGrouped).forEach((postId) => {
              newGrouped[postId] = newGrouped[postId].map((ad) =>
                ad.id === advertiseId
                  ? {
                      ...ad,
                      statistics: data.statistics || [],
                      total_reach: data.total_reach || ad.total_reach,
                      total_clicks: data.total_clicks || ad.total_clicks,
                      total_impression: data.total_impression || ad.total_impression,
                      resultsData: data.statistics?.map((stat: StatisticEntry) => stat.clicks || 0) || ad.resultsData,
                      reachData: data.statistics?.map((stat: StatisticEntry) => stat.reach || 0) || ad.reachData,
                      impressionsData:
                        data.statistics?.map((stat: StatisticEntry) => stat.impression || 0) || ad.impressionsData,
                      labels:
                        data.statistics?.map((stat: StatisticEntry) =>
                          dayjs(stat.aggregation_date).format("HH:mm:ss DD/MM")
                        ) || ad.labels,
                    }
                  : ad
              );
            });
            return newGrouped;
          });
        }
        return data;
      } catch (err) {
        console.error(`Error preloading statistics for advertiseId ${advertiseId}:`, err);
        return null;
      } finally {
        setLoadingStatistics(false);
      }
    },
    [fetchAdStatistics]
  );

  const fetchAds = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const request: GetUsersPostsRequestModel = {
        user_id: user.id,
        isDescending: true,
        limit: 12,
        page,
      };

      const res = await repo.getAdvertisementPosts(request);
      if (!res?.data) {
        setError("Failed to fetch advertisement data");
        setHasMore(false);
        return;
      }

      const mappedAds: MappedAd[] = [];
      const grouped: Record<string, MappedAd[]> = {};

      const adPromises = res.data.map(async (item: any) => {
        const post = item.post;
        const postId = post.id;

        if (!grouped[postId]) {
          grouped[postId] = [];
        }

        // Gọi getAdvertisePost để lấy advertiseId
        const params: AdvertisePostRequestModel = { post_id: postId };
        const adResponse = await repo.getAdvertisePost(params);
        const adsForPost = adResponse?.data
          ? Array.isArray(adResponse.data)
            ? adResponse.data
            : [adResponse.data]
          : [];

        // Tìm quảng cáo khớp với start_date và end_date
        const matchedAd = adsForPost.find(
          (ad) =>
            ad.start_date === item.start_date && ad.end_date === item.end_date
        );

        const advertiseId = matchedAd?.id || postId; // Fallback về postId nếu không tìm thấy

        const startDate = item.start_date ? DateTransfer(new Date(item.start_date)) : "N/A";
        const endDate = item.end_date ? DateTransfer(new Date(item.end_date)) : "N/A";
        const daysRemaining =
          dayjs(item.end_date).diff(dayjs(), "day") >= 0
            ? dayjs(item.end_date).diff(dayjs(), "day")
            : 0;

        const statistics: StatisticEntry[] = matchedAd?.statistics || [];
        const resultsData = statistics.map((stat: StatisticEntry) => stat.clicks || 0);
        const reachData = statistics.map((stat: StatisticEntry) => stat.reach || 0);
        const impressionsData = statistics.map((stat: StatisticEntry) => stat.impression || 0);
        const labels = statistics.map((stat: StatisticEntry) =>
          dayjs(stat.aggregation_date).format("HH:mm:ss DD/MM")
        );

        const adStatus = item.bill_price ? "success" : "failed";

        const mappedAd: MappedAd = {
          id: advertiseId,
          post_id: postId,
          post: {
            id: postId,
            content: post.content,
            media: post.media,
            parent_post: post.parent_post,
            user_id: post.user_id,
            user: post.user,
            parent_id: post.parent_id,
            like_count: post.like_count,
            comment_count: post.comment_count,
            updated_at: post.updated_at,
            privacy: post.privacy,
            location: post.location,
            is_advertisement: post.is_advertisement,
            status: post.status,
            created_at: post.created_at,
          },
          status: adStatus,
          start_date: startDate,
          end_date: endDate,
          day_remaining: daysRemaining,
          resultsData,
          reachData,
          impressionsData,
          labels,
          bill: {
            price: item.bill_price,
            status: item.bill_price ? true : false,
          },
          isActive: dayjs().isBefore(dayjs(item.end_date), "day"),
          status_action: dayjs().isBefore(dayjs(item.end_date), "day")
            ? localStrings.Ads.Active
            : localStrings.Ads.Completed,
          total_reach: matchedAd?.total_reach || 0,
          total_clicks: matchedAd?.total_clicks || 0,
          total_impression: matchedAd?.total_impression || 0,
          statistics,
        };

        mappedAds.push(mappedAd);
        grouped[postId].push(mappedAd);

        // Lưu post details
        setPostDetails((prev) => ({
          ...prev,
          [postId]: {
            id: postId,
            content: post.content,
            media: post.media,
          } as AdvertisePostResponseModel,
        }));
      });

      await Promise.all(adPromises);

      setAds((prevAds) => (page === 1 ? mappedAds : [...prevAds, ...mappedAds]));
      setGroupedAds(grouped);
      setHasMore(res.data.length === 12);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsLoadingPostDetails(false);
    }
  }, [user?.id, page, repo, localStrings.Ads]);

  const loadMoreAds = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  const advertisePost = useCallback(
    async (params: AdvertisePostRequestModel) => {
      try {
        const res = await repo.advertisePost(params);
        if (res?.data) {
          setPage(1);
          await fetchAds();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error creating advertisement");
      }
    },
    [repo, fetchAds]
  );

  useEffect(() => {
    if (user?.id) fetchAds();
  }, [fetchAds, user?.id]);

  return useMemo(
    () => ({
      loading,
      loadingStatistics,
      ads,
      groupedAds,
      error,
      advertisePost,
      fetchAds,
      loadMoreAds,
      postDetails,
      isLoadingPostDetails,
      hasMore,
      preloadStatistics,
    }),
    [
      loading,
      loadingStatistics,
      ads,
      groupedAds,
      error,
      advertisePost,
      fetchAds,
      loadMoreAds,
      postDetails,
      isLoadingPostDetails,
      hasMore,
      preloadStatistics,
    ]
  );
};

export default useAdsManagement;