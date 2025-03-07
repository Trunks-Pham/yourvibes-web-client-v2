import { useState, useEffect, useCallback, useRef } from 'react';
import dayjs from 'dayjs';
import { GetUsersPostsRequestModel } from '@/api/features/post/models/GetUsersPostsModel';
import { defaultPostRepo, PostRepo } from '@/api/features/post/PostRepo';
import { useAuth } from '@/context/auth/useAuth';
import { PostResponseModel } from '@/api/features/post/models/PostResponseModel';
import {
  AdvertisePostRequestModel,
  AdvertisePostResponseModel,
  BillModel,
} from '@/api/features/post/models/AdvertisePostModel';
import AdsViewModel from '@/components/screens/ads/viewModel/AdsViewModel';

const mapAdToSummary = (item: PostResponseModel & { bill: BillModel }): AdvertisePostResponseModel => {
  const daysRemaining = (item.bill as { end_date: string })?.end_date
    ? Math.max(
      0,
      Math.floor(new Date((item.bill as { end_date: string }).end_date).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24),
    )
    : 0;
  const formattedPrice = item.bill?.price ?? 0;
  return {
    status: item.status?.toString(),
    start: (item.bill as { start_date: string })?.start_date
      ? new Date((item.bill as { start_date: string }).start_date).toLocaleDateString()
      : 'N/A',
    end: (item.bill as { end_date: string })?.end_date
      ? new Date((item.bill as { end_date: string }).end_date).toLocaleDateString()
      : 'N/A',
    days: daysRemaining,
    price: formattedPrice,
    billStatus: item.bill?.status ?? 'N/A',
    totalResults: (item as AdvertisePostResponseModel).results ?? 0,
    totalReach: (item as AdvertisePostResponseModel).reach ?? 0,
    totalImpressions: (item as AdvertisePostResponseModel).impressions ?? 0,
    resultsData: [],
    reachData: [],
    impressionsData: [],
    labels: [],
    is_advertisement: true,
  };
};

const useAdsManagement = (repo: PostRepo = defaultPostRepo) => {
  const { user, localStrings } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [adsLoading, setAdsLoading] = useState<boolean>(false);
  const [ads, setAds] = useState<AdvertisePostResponseModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [adsSummaryList, setAdsSummaryList] = useState<AdvertisePostResponseModel[]>([]);
  const [adsDetail, setAdsDetail] = useState<
    AdvertisePostResponseModel | undefined
  >(undefined);

  const {
    getPostDetail: getPostDetailFromAdsView,
    advertisePost: advertisePostFromAdsView,
    getAdvertisePost: getAdvertisePostFromAdsView,
    adsAll,
    post: postDetail,
  } = AdsViewModel(repo);

  //Quảng cáo bài viết
  const advertisePost = async (params: AdvertisePostRequestModel) => {
    await advertisePostFromAdsView(params);
  };

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const request: GetUsersPostsRequestModel = {
        is_advertisement: true,
        user_id: user?.id, // only depend on user.id
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
            let campaignStart = '';
            let campaignEnd = '';
            let paymentMethod = '';

            if (item.bill?.end_date && item.bill?.start_date) {
              startDate = dayjs(item.bill.start_date).format('DD/MM/YYYY');
              endDate = dayjs(item.bill.end_date).format('DD/MM/YYYY');
              campaignStart = dayjs(item.bill.start_date).format('DD/MM/YYYY');
              campaignEnd = dayjs(item.bill.end_date).format('DD/MM/YYYY');
              daysRemaining = dayjs(item.bill.end_date).diff(dayjs(), 'day');
              daysRemaining = daysRemaining < 0 ? 0 : daysRemaining;
              paymentMethod = 'MoMo';
            }

            const billPriceFormat = new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(item.bill?.price ?? 0);

            const resultsData = Array.from({ length: 7 }, () =>
              Math.floor(Math.random() * 50),
            );
            const reachData = Array.from({ length: 7 }, () =>
              Math.floor(Math.random() * 200),
            );
            const impressionsData = Array.from({ length: 7 }, () =>
              Math.floor(Math.random() * 500),
            );
            const labels = Array.from({ length: 7 }, (_, i) =>
              dayjs().subtract(i, 'day').format('DD/MM/YYYY'),
            ).reverse();
            const media = item.media
              ? item.media.map((url) => ({ url }))
              : [];

            return {
              id: item.id,
              content: item.content ?? '',
              active: item.bill?.status === 'success' ? true : false,
              status: item.status,
              results: item.results,
              reach: item.reach,
              impressions: item.impressions ?? 0,
              price: item.bill?.price ?? 0,
              startDate: startDate,
              endDate: endDate,
              daysRemaining: daysRemaining,
              labels,
              media: media,
              resultsData,
              reachData,
              impressionsData,
              is_advertisement: item.is_advertisement,
              postId: item.id,
              billId: item.bill?.id,
              billStatus: item.bill?.status,
              billPrice: item.bill?.price,
              paymentMethod: paymentMethod,
              campaignStart: campaignStart,
              campaignEnd: campaignEnd,
              billPriceFormat: billPriceFormat,
            };
          });
        const mappedSummaryAds: AdvertisePostResponseModel[] = res.data
          .filter((ad) => ad.is_advertisement)
          .map((item: PostResponseModel) => {
            return mapAdToSummary(item);
          });
        setAdsSummaryList(mappedSummaryAds);
        if (page === 1) {
          setAds(mappedAds);
        } else {
          setAds((prevAds) => [...prevAds, ...mappedAds]);
        }
      } else {
        setError('Không thể lấy dữ liệu quảng cáo');
      }
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi không xác định');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, page]); // only depend on user.id and page

  const loadMoreAds = () => {
    setPage((prevPage) => {
      const newPage = prevPage + 1;
      return newPage;
    });
  };

  const deleteAd = (id: string) => {
    setAds((currentAds) => currentAds.filter((ad) => ad.id !== id));
  };
  const getPostDetail = async (id: string) => {
    const res = await getPostDetailFromAdsView(id);
    return res;
  };
  const getAdvertisePost = async (postId: string) => {
    await getAdvertisePostFromAdsView(1, postId);
  };
  useEffect(() => {
    fetchAds();
  }, []);

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
    postDetail,
  };
};

export default useAdsManagement;
