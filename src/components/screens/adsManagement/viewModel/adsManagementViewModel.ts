import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { GetUsersPostsRequestModel } from '@/api/features/post/models/GetUsersPostsModel';
import { defaultPostRepo, PostRepo } from '@/api/features/post/PostRepo';
import { useAuth } from '@/context/auth/useAuth';
import { PostResponseModel } from '@/api/features/post/models/PostResponseModel';
import {
  AdvertisePostRequestModel,
  AdvertisePostResponseModel,
} from '@/api/features/post/models/AdvertisePostModel';

const useAdsManagement = (repo: PostRepo = defaultPostRepo) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [ads, setAds] = useState<AdvertisePostResponseModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [postDetails, setPostDetails] = useState<Record<string, PostResponseModel>>({}); // Lưu chi tiết bài viết theo post_id

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const request: GetUsersPostsRequestModel = {
        user_id: user?.id,
        sort_by: 'created_at',
        isDescending: true,
        limit: 10,
        page: page,
        is_advertisement: true,
      };
      const res = await repo.getAdvertisementPosts(request);
      if (res?.data) {
        const filteredAds = res.data.filter((item) => item.is_advertisement === true);
        const mappedAds: AdvertisePostResponseModel[] = filteredAds.map((item: PostResponseModel) => {
          let daysRemaining = 0;
          let startDate = '';
          let endDate = '';

          if (item.created_at) {
            startDate = dayjs(item.created_at).format('DD/MM/YYYY');
            endDate = item.is_advertisement ? dayjs(item.created_at).add(7, 'day').format('DD/MM/YYYY') : '';
            daysRemaining = dayjs(endDate).diff(dayjs(), 'day');
            daysRemaining = daysRemaining < 0 ? 0 : daysRemaining;
          }

          const resultsData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 50));
          const reachData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 200));
          const impressionsData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 500));
          const labels = Array.from({ length: 7 }, (_, i) =>
            dayjs().subtract(i, 'day').format('DD/MM/YYYY')
          ).reverse();

          return {
            id: item.id,
            post_id: item.id,
            status: item.status?.toString(),
            start_date: startDate,
            end_date: endDate,
            bill: item.bill || { price: 0, status: 'complete' },
            day_remaining: daysRemaining,
            resultsData,
            reachData,
            impressionsData,
            labels,
            is_advertisement: item.is_advertisement,
          };
        });

        if (page === 1) {
          setAds(mappedAds);
        } else {
          setAds((prevAds) => [...prevAds, ...mappedAds]);
        }

        // Tải chi tiết bài viết cho tất cả quảng cáo khi vào trang
        for (const ad of mappedAds) {
          if (ad.post_id && !postDetails[ad.post_id]) {
            const post = await repo.getPostById(ad.post_id);
            if (post?.data && post.data.is_advertisement) {
              setPostDetails((prev) => ({ ...prev, [ad.post_id!]: post.data }));
            }
          }
        }
      } else {
        setError('Không thể lấy dữ liệu quảng cáo');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, repo, postDetails]);

  const loadMoreAds = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const advertisePost = async (params: AdvertisePostRequestModel) => {
    try {
      const res = await repo.advertisePost(params);
      if (res?.data) {
        fetchAds();
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo quảng cáo');
    }
  };

  const getPostDetail = async (id: string) => {
    try {
      const res = await repo.getPostById(id);
      if (res?.data && res.data.is_advertisement) {
        setPostDetails((prev) => ({ ...prev, [id]: res.data }));
        return res.data;
      } else {
        setError('Bài viết không phải là quảng cáo');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lấy chi tiết bài viết');
    }
    return null;
  };

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return {
    loading,
    ads,
    error,
    advertisePost,
    fetchAds,
    loadMoreAds,
    getPostDetail,
    postDetails, // Trả về object chứa chi tiết bài viết
  };
};

export default useAdsManagement;