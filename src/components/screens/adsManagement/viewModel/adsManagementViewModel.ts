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
  const [postDetails, setPostDetails] = useState<Record<string, PostResponseModel>>({});
  const [isLoadingPostDetails, setIsLoadingPostDetails] = useState<boolean>(false);

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
            bill: item.bill || { price: 0, status: 'active' },
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

        //Get details of post
        setIsLoadingPostDetails(true)
        const postIdsToFetch = mappedAds.map((ad) => ad.post_id).filter((postId) => !postDetails[postId!]);
        if (postIdsToFetch.length > 0) {
          const fetchPostDetails = async () => {
            const newPostDetails: Record<string, PostResponseModel> = {};
            await Promise.all(
              postIdsToFetch.map(async (postId) => {
                const post = await repo.getPostById(postId!);
                if (post?.data && post.data.is_advertisement) {
                  newPostDetails[postId!] = post.data;
                }
              })
            );
            setPostDetails((prev) => ({ ...prev, ...newPostDetails }));
          }
          await fetchPostDetails()
        }
      } else {
        setError('Không thể lấy dữ liệu quảng cáo');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setLoading(false);
      setIsLoadingPostDetails(false)
    }
  }, [user?.id, page, repo]);

  const loadMoreAds = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const advertisePost = async (params: AdvertisePostRequestModel) => {
    try {
      const res = await repo.advertisePost(params);
      if (res?.data) {
        //Reload page 1
        setPage(1)
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo quảng cáo');
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAds();
    }
  }, [fetchAds, user?.id]);

  return {
    loading,
    ads,
    error,
    advertisePost,
    fetchAds,
    loadMoreAds,
    postDetails,
    isLoadingPostDetails
  };
};

export default useAdsManagement;
