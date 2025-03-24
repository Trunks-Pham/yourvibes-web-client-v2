import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { GetUsersPostsRequestModel } from '@/api/features/post/models/GetUsersPostsModel';
import { defaultPostRepo, PostRepo } from '@/api/features/post/PostRepo';
import { useAuth } from '@/context/auth/useAuth';
import {
  AdvertisePostRequestModel,
  AdvertisePostResponseModel,
  BillModel,
} from '@/api/features/post/models/AdvertisePostModel';
import { DateTransfer, getDayDiff } from '@/utils/helper/DateTransfer';

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
    if (ad.status !== 'success' && ad.bill?.status !== 'success') return false;
    const now = dayjs();
    const end = dayjs(ad.end_date); // Không cần định dạng cứng, để dayjs tự parse
    return end.isValid() && now.isBefore(end);
  };

  const getStatusAction = (ad: AdvertisePostResponseModel): string => {
    if (ad.status !== 'success' && ad.bill?.status !== 'success') {
      return localStrings.Ads.Active;
    }
    return isAdActive(ad) ? localStrings.Ads.Pending : localStrings.Ads.Completed;
  };

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
        setError('Không thể lấy dữ liệu quảng cáo');
        setHasMore(false);
        return;
      }

      const filteredAds: AdvertisePostResponseModel[] = (res.data as AdvertisePostResponseModel[]).filter(
        (item) => Number(item.is_advertisement) === 1 || Number(item.is_advertisement) === 2
      );
      if (filteredAds.length === 0 && page > 1) {
        setHasMore(false);
      }

      const mappedAds: MappedAd[] = filteredAds.map((item: AdvertisePostResponseModel) => {
        // Chuẩn hóa start_date và end_date
        let startDate = item.start_date;
        let endDate = item.end_date;
        let daysRemaining = item.day_remaining;

        // Nếu start_date không có, dùng created_at
        if (!startDate && item.created_at) {
          const createdAt = dayjs(item.created_at);
          if (createdAt.isValid()) {
            startDate = createdAt.format('DD/MM/YYYY');
          }
        }
        // Nếu start_date vẫn không hợp lệ, dùng ngày hiện tại
        if (!startDate || !dayjs(startDate).isValid()) {
          startDate = dayjs().format('DD/MM/YYYY');
        }

        // Nếu end_date không có, tính từ start_date + 7 ngày
        if (!endDate && startDate) {
          const start = dayjs(startDate, 'DD/MM/YYYY');
          if (start.isValid()) {
            const endAt = start.add(7, 'day');
            endDate = endAt.format('DD/MM/YYYY');
            daysRemaining = getDayDiff(endAt.toDate());
          }
        }
        // Nếu end_date không hợp lệ, đặt mặc định
        if (!endDate || !dayjs(endDate).isValid()) {
          endDate = dayjs(startDate, 'DD/MM/YYYY').add(7, 'day').format('DD/MM/YYYY');
          daysRemaining = 7;
        }

        // Nếu daysRemaining chưa được tính
        if (daysRemaining === undefined && endDate) {
          const end = dayjs(endDate, 'DD/MM/YYYY');
          if (end.isValid()) {
            daysRemaining = Math.max(getDayDiff(end.toDate()), 0);
          } else {
            daysRemaining = 0;
          }
        }

        const resultsData = item.resultsData || Array.from({ length: 7 }, () => Math.floor(Math.random() * 50));
        const reachData = item.reachData || Array.from({ length: 7 }, () => Math.floor(Math.random() * 200));
        const impressionsData = item.impressionsData || Array.from({ length: 7 }, () => Math.floor(Math.random() * 500));
        const labels = item.labels || Array.from({ length: 7 }, (_, i) =>
          DateTransfer(dayjs().subtract(i, 'day').toDate())
        ).reverse();

        let adStatus = item.status?.toString() || 'N/A';
        if (item.bill?.status) {
          adStatus = item.bill.status;
        }

        return {
          ...item,
          post_id: item.id,
          status: adStatus,
          start_date: startDate,
          end_date: endDate,
          day_remaining: daysRemaining ?? 0,
          resultsData,
          reachData,
          impressionsData,
          labels,
          is_advertisement: item.is_advertisement,
          bill: item.bill,
          isActive: isAdActive(item),
          status_action: getStatusAction(item),
        };
      });

      setAds((prevAds) => (page === 1 ? mappedAds : [...prevAds, ...mappedAds]));
      setHasMore(filteredAds.length === 10);

      setIsLoadingPostDetails(true);
      const postIdsToFetch = mappedAds
        .map((ad) => ad.post_id)
        .filter((postId): postId is string => !!postId && !postDetails[postId]);

      if (postIdsToFetch.length > 0) {
        const newPostDetails: Record<string, AdvertisePostResponseModel> = {};
        await Promise.all(
          postIdsToFetch.map(async (postId) => {
            const post = await repo.getPostById(postId);
            if (post?.data && post.data.is_advertisement) {
              newPostDetails[postId] = post.data as AdvertisePostResponseModel;
            }
          })
        );
        setPostDetails((prev) => ({ ...prev, ...newPostDetails }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
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
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo quảng cáo');
    }
  };

  useEffect(() => {
    if (user?.id) fetchAds();
  }, [fetchAds, user?.id, page]);

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