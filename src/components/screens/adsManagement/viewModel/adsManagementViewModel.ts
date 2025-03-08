import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { GetUsersPostsRequestModel } from '@/api/features/post/models/GetUsersPostsModel';
import { defaultPostRepo, PostRepo } from '@/api/features/post/PostRepo';
import { useAuth } from '@/context/auth/useAuth';
import { PostResponseModel } from '@/api/features/post/models/PostResponseModel';
import {
  AdvertisePostRequestModel,
  AdvertisePostResponseModel,
  GetAdvertiseRequestModel
} from '@/api/features/post/models/AdvertisePostModel';
import AdsViewModel from '@/components/screens/ads/viewModel/AdsViewModel';

const useAdsManagement = (repo: PostRepo = defaultPostRepo) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [adsLoading, setAdsLoading] = useState<boolean>(false);
  const [ads, setAds] = useState<AdvertisePostResponseModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [adsSummaryList, setAdsSummaryList] = useState<AdvertisePostResponseModel[]>([]);
  const [adsDetail, setAdsDetail] = useState<AdvertisePostResponseModel | undefined>(undefined);

  const {
    getPostDetail: getPostDetailFromAdsView,
    advertisePost: advertisePostFromAdsView,
    getAdvertisePost: getAdvertisePostFromAdsView,
    adsAll,
    post: postDetail
  } = AdsViewModel(repo);

  const advertisePost = async (params: AdvertisePostRequestModel) => {
    await advertisePostFromAdsView(params);
  };

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const request: GetUsersPostsRequestModel = {
        is_advertisement: true,
        user_id: user?.id,
        sort_by: 'created_at',
        isDescending: true,
        limit: 10,
        page: page,
      };
      const res = await repo.getPosts(request);
      if (res?.data) {
        const mappedAds: AdvertisePostResponseModel[] = res.data
          .filter((ad) => ad.is_advertisement)
          .map((item: PostResponseModel) => {
            let daysRemaining = 0;
            let startDate = '';
            let endDate = '';

            if (item.bill?.end_date && item.bill?.start_date) {
              startDate = dayjs(item.bill.start_date).format('DD/MM/YYYY');
              endDate = dayjs(item.bill.end_date).format('DD/MM/YYYY');
              daysRemaining = dayjs(item.bill.end_date).diff(dayjs(), 'day');
              daysRemaining = daysRemaining < 0 ? 0 : daysRemaining;
            }

            const resultsData = Array.from({ length: 7 }, () =>
              Math.floor(Math.random() * 50)
            );
            const reachData = Array.from({ length: 7 }, () =>
              Math.floor(Math.random() * 200)
            );
            const impressionsData = Array.from({ length: 7 }, () =>
              Math.floor(Math.random() * 500)
            );
            const labels = Array.from({ length: 7 }, (_, i) =>
              dayjs().subtract(i, 'day').format('DD/MM/YYYY')
            ).reverse();

            return {
              id: item.id,
              post_id: item.id,
              status: item.status?.toString(),
              start_date: startDate,
              end_date: endDate,
              bill: item.bill,
              day_remaining: daysRemaining,
              resultsData,
              reachData,
              impressionsData,
              labels,
              is_advertisement: item.is_advertisement
            };
          });

        setAdsSummaryList(mappedAds);
        if (page === 1) {
          setAds(mappedAds);
        } else {
          setAds(prevAds => [...prevAds, ...mappedAds]);
        }
      } else {
        setError('Không thể lấy dữ liệu quảng cáo');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, repo]);

  const loadMoreAds = () => {
    setPage(prevPage => prevPage + 1);
  };

  const deleteAd = (id: string) => {
    setAds(currentAds => currentAds.filter(ad => ad.id !== id));
  };

  const getPostDetail = async (id: string) => {
    return await getPostDetailFromAdsView(id);
  };

  const getAdvertisePost = async (params: GetAdvertiseRequestModel) => {
    await getAdvertisePostFromAdsView(params.page || 1, params.post_id || '');
  };

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return {
    loading,
    adsLoading,
    ads,
    error,
    advertisePost,
    fetchAds,
    deleteAd,
    loadMoreAds,
    page,
    setPage,
    adsSummaryList,
    getPostDetail,
    getAdvertisePost,
    adsAll,
    postDetail
  };
};

export default useAdsManagement;