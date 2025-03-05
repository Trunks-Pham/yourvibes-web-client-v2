import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { GetUsersPostsRequestModel } from '@/api/features/post/models/GetUsersPostsModel';
import { defaultPostRepo, PostRepo } from '@/api/features/post/PostRepo';
import { useAuth } from '@/context/auth/useAuth';
import { PostResponseModel, PostMediaModel } from '@/api/features/post/models/PostResponseModel';
import {
  AdvertisePostRequestModel,
  AdvertisePostResponseModel,
} from "@/api/features/post/models/AdvertisePostModel"; 
import AdsViewModel from '@/components/screens/ads/viewModel/AdsViewModel';

export interface Ad {
  id: number;
  content: string;
  active: boolean;
  status: string;
  results: number;
  reach: number;
  impressions: number;
  price: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  labels: string[];
  media: PostMediaModel[];
  resultsData: number[];
  reachData: number[];
  impressionsData: number[];
  is_advertisement: boolean;
  postId: string;
  billId?: string;
  billStatus?: string;
  billPrice?: number;

  paymentMethod?: string;
  campaignStart: string;
  campaignEnd: string;
  billPriceFormat?: string;
}

export interface AdSummary {
  status: string;
  start: string;
  end: string;
  days: number;
  price: number;
  billStatus: string;
  totalResults: number;
  totalReach: number;
  totalImpressions: number;
}

const mapAdToSummary = (item: PostResponseModel): AdSummary => {
  const daysRemaining = item.bill?.end_date
    ? Math.max(
      0,
      Math.floor(new Date(item.bill.end_date).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
    )
    : 0;
  const formattedPrice = item.bill?.price ?? 0;
  return {
    status: item.status,
    start: item.bill?.start_date
      ? new Date(item.bill.start_date).toLocaleDateString()
      : "N/A",
    end: item.bill?.end_date
      ? new Date(item.bill.end_date).toLocaleDateString()
      : "N/A",
    days: daysRemaining,
    price: formattedPrice,
    billStatus: item.bill?.status ?? "N/A",
    totalResults: item.results ?? 0,
    totalReach: item.reach ?? 0,
    totalImpressions: item.impressions ?? 0,
  };
};

const useAdsManagement = (repo: PostRepo = defaultPostRepo) => {
  const { user, localStrings } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [adsLoading, setAdsLoading] = useState<boolean>(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [adsSummaryList, setAdsSummaryList] = useState<AdSummary[]>([]);
  const [adsDetail, setAdsDetail] = useState<AdvertisePostResponseModel | undefined>(undefined);

  const {
    getPostDetail: getPostDetailFromAdsView,
    advertisePost: advertisePostFromAdsView,
    getAdvertisePost: getAdvertisePostFromAdsView,
    loadMoreAds: loadMoreAdsFromAdsView,
    adsAll,
    post: postDetail
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
        user_id: user?.id,
        sort_by: 'created_at',
        isDescending: true,
        limit: 10,
        page: page,
      };
      const res = await repo.getPosts(request);
      if (res?.data) {
        const mappedAds: Ad[] = res.data
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
              daysRemaining = dayjs(item.bill.end_date).diff(
                dayjs(),
                'day'
              );
              daysRemaining = daysRemaining < 0 ? 0 : daysRemaining;
              paymentMethod = "MoMo";
            }

            const billPriceFormat = new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(item.bill?.price ?? 0);

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
              dayjs()
                .subtract(i, 'day')
                .format('DD/MM/YYYY')
            ).reverse();
            const media = item.media ? item.media.map((url) => ({ url })) : [];

            return {
              id: Number(item.id),
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
        const mappedSummaryAds: AdSummary[] = res.data
          .filter((ad) => ad.is_advertisement)
          .map((item: PostResponseModel) => {
            return mapAdToSummary(item);
          });
        setAdsSummaryList(mappedSummaryAds)
        if (page === 1) {
          setAds(mappedAds);
        } else {
          setAds(prevAds => [...prevAds, ...mappedAds]);
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
  }, [user?.id, page]);

  const loadMoreAds = () => {
    setPage(prevPage => {
      const newPage = prevPage + 1;
      return newPage;
    });
  };

  const deleteAd = (id: number) => {
    setAds((currentAds) => currentAds.filter((ad) => ad.id !== id));
  };
  const getPostDetail = async (id: string) => {
    await getPostDetailFromAdsView(id);
  };
  const getAdvertisePost = async (postId: string) => {
    await getAdvertisePostFromAdsView(1, postId);
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
