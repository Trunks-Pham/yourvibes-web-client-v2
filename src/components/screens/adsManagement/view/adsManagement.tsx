"use client";

import { useState, useEffect } from "react";
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Modal, Spin, Button } from 'antd';
import PostList from "@/components/screens/profile/components/PostList";
import { AdvertisePostResponseModel } from "@/api/features/post/models/AdvertisePostModel";
import { GetUsersPostsRequestModel } from '@/api/features/post/models/GetUsersPostsModel';
import { defaultPostRepo, PostRepo } from '@/api/features/post/PostRepo';
import { DateTransfer } from "@/utils/helper/DateTransfer";
import { CurrencyFormat } from "@/utils/helper/CurrencyFormat";
import useAdsManagement from "../viewModel/adsManagementViewModel";
import Post from "@/components/common/post/views/Post";
import { useAuth } from "@/context/auth/useAuth";
import dayjs from 'dayjs';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdDetailsModal = ({ ad, onClose, post }: { ad: AdvertisePostResponseModel; onClose: () => void; post?: any }) => {
  const { localStrings } = useAuth();

  const data = {
    labels: ad.labels || [],
    datasets: [
      {
        label: localStrings.Ads.TotalResults,
        data: ad.resultsData || [],
        borderColor: '#3498db',
        fill: false,
        tension: 0.3,
      },
      {
        label: localStrings.Ads.TotalReach,
        data: ad.reachData || [],
        borderColor: '#2ecc71',
        fill: false,
        tension: 0.3,
      },
      {
        label: localStrings.Ads.TotalImpressions,
        data: ad.impressionsData || [],
        borderColor: '#e67e22',
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5,
    scales: {
      x: { title: { display: true, text: localStrings.Public.Day } },
      y: { title: { display: true, text: "Value" }, beginAtZero: true },
    },
    plugins: {
      legend: { position: "top" as const, labels: { boxWidth: 10, padding: 10 } },
      tooltip: { mode: "index" as const, intersect: false },
    },
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  // Chuẩn hóa ngày bắt đầu
  const startDate = ad.start_date && dayjs(ad.start_date).isValid()
    ? DateTransfer(ad.start_date)
    : ad.created_at && dayjs(ad.created_at).isValid()
      ? DateTransfer(ad.created_at)
      : 'N/A';

  // Chuẩn hóa ngày kết thúc
  const endDate = ad.end_date && dayjs(ad.end_date).isValid()
    ? DateTransfer(ad.end_date)
    : ad.start_date && dayjs(ad.start_date).isValid()
      ? DateTransfer(dayjs(ad.start_date).add(7, 'day').toDate()) // Giả định 7 ngày nếu không có end_date
      : 'N/A';

  // Tính toán số ngày còn lại
  const remainingDays = (() => {
    if (ad.day_remaining !== undefined) return ad.day_remaining;
    if (ad.end_date && dayjs(ad.end_date).isValid()) {
      const diff = dayjs(ad.end_date).diff(dayjs(), 'day');
      return Math.max(diff, 0); // Đảm bảo không âm
    }
    return 'N/A'; // Nếu không tính được
  })();

  // Chuẩn hóa chi phí
  const grant = ad.bill?.price ? CurrencyFormat(ad.bill.price) : 'N/A';

  const paymentMethod = 'MoMo'; // Giả định, cần thay đổi nếu có dữ liệu thực tế
  const paymentStatus = ad.bill?.status === 'success' ? localStrings.Ads.PaymentSuccess : localStrings.Ads.PaymentFailed;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div
        className="bg-white p-6 rounded-xl shadow-2xl relative overflow-hidden"
        style={{ width: '1000px', maxHeight: '900px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={handleCloseModal}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col md:flex-row gap-4 h-full overflow-y-auto">
          <div className="md:w-1/2 w-full flex justify-center items-center" style={{ minHeight: '250px' }}>
            {post && (post.is_advertisement === 1 || post.is_advertisement === 2) ? (
              <div className="w-full h-full overflow-hidden flex flex-col" style={{ maxHeight: '100%' }}>
                <Post post={post} noFooter>
                  {post.media && post.media.length > 0 && (
                    <div className="w-full h-auto flex-shrink-0">
                      {post.media.map((media: { media_url: string }, index: number) => {
                        const isVideo = /\.(mp4|webm|ogg)$/i.test(media.media_url);
                        return isVideo ? (
                          <video
                            key={index}
                            src={media.media_url}
                            controls
                            className="w-full h-auto max-h-[250px] object-contain rounded-md"
                          />
                        ) : (
                          <img
                            key={index}
                            src={media.media_url}
                            alt={post.content || 'Ad Image'}
                            className="w-full h-auto max-h-[250px] object-contain rounded-md"
                          />
                        );
                      })}
                    </div>
                  )}
                </Post>
              </div>
            ) : (
              <Spin tip="Loading post..." />
            )}
          </div>
          <div className="md:w-1/2 flex flex-col gap-2 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                <p><strong>{localStrings.Ads.StartDay}:</strong> {startDate}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                <p><strong>{localStrings.Ads.End}:</strong> {endDate}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                <p><strong>{localStrings.Ads.RemainingTime}:</strong> {remainingDays} {remainingDays !== 'N/A' ? localStrings.Ads.Day : ''}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                <p><strong>{localStrings.Ads.Grant}:</strong> {grant}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                <p><strong>{localStrings.Ads.PaymentMethod}:</strong> {paymentMethod}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                <p><strong>{localStrings.Ads.Status}:</strong> {paymentStatus}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-md border border-gray-200 md:col-span-2">
                <p><strong>{localStrings.Ads.StatusActive}:</strong> {ad.isActive ? 'Active' : 'Done'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-700">
              <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                <p><strong>{localStrings.Ads.TotalResults}:</strong> {ad.resultsData?.reduce((sum, num) => sum + num, 0) || 0}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                <p><strong>{localStrings.Ads.TotalReach}:</strong> {ad.reachData?.reduce((sum, num) => sum + num, 0) || 0}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                <p><strong>{localStrings.Ads.TotalImpressions}:</strong> {ad.impressionsData?.reduce((sum, num) => sum + num, 0) || 0}</p>
              </div>
            </div>
            <div className="h-[250px]">
              <Line data={data} options={options} />
            </div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <Button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={handleCloseModal}>
            {localStrings.Public.Close}
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdsManagementFeature = () => {
  const {
    loading,
    ads,
    loadMoreAds,
    postDetails,
    isLoadingPostDetails,
    hasMore,
  } = useAdsManagement();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAds, setFilteredAds] = useState<AdvertisePostResponseModel[]>([]);
  const [selectedAd, setSelectedAd] = useState<AdvertisePostResponseModel | null>(null);
  const [isPostListModalVisible, setIsPostListModalVisible] = useState(false);
  const [modalPosts, setModalPosts] = useState<any[]>([]);
  const [isLoadingModalPosts, setIsLoadingModalPosts] = useState(false);
  const { localStrings, user } = useAuth();
  const repo: PostRepo = defaultPostRepo;

  useEffect(() => {
    const filter = ads.filter((ad: AdvertisePostResponseModel) => {
      const postIdMatch = ad.post_id && ad.post_id.toLowerCase().includes(searchTerm.toLowerCase());
      const postContentMatch = postDetails[ad.post_id!] && postDetails[ad.post_id!].content?.toLowerCase().includes(searchTerm.toLowerCase());
      return postIdMatch || postContentMatch;
    });
    setFilteredAds(filter);
  }, [searchTerm, ads, postDetails]);

  const fetchNonAdPosts = async () => {
    setIsLoadingModalPosts(true);
    try {
      const request: GetUsersPostsRequestModel = {
        user_id: user?.id,
        sort_by: 'created_at',
        isDescending: true,
        limit: 10,
        page: 1,
      };
      const res = await repo.getPosts(request);
      if (res?.data) {
        const filteredPosts = res.data.filter((post) => post.is_advertisement === false);
        setModalPosts(filteredPosts);
      }
    } catch (err) {
      console.error("Error fetching non-ad posts:", err);
    } finally {
      setIsLoadingModalPosts(false);
    }
  };

  useEffect(() => {
    if (isPostListModalVisible) {
      fetchNonAdPosts();
    }
  }, [isPostListModalVisible]);

  const openModal = (ad: AdvertisePostResponseModel) => {
    setSelectedAd(ad);
  };

  const closeModal = () => {
    setSelectedAd(null);
  };

  const handleLoadMore = () => {
    loadMoreAds();
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-800">{localStrings.Ads.AdsManagement}</h1>
        <div className="flex gap-3">
          <button
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
            onClick={() => setIsPostListModalVisible(true)}
          >
            {localStrings.Ads.SelectAds}
          </button>
        </div>
      </div>

      <Modal
        title={<div style={{ textAlign: "center", fontSize: 24, fontWeight: "bold" }}>{localStrings.Ads.SelectAds}</div>}
        open={isPostListModalVisible}
        onCancel={() => setIsPostListModalVisible(false)}
        footer={null}
        width={700}
        centered
        bodyStyle={{ maxHeight: '700px', overflowY: 'auto', padding: '16px' }}
      >
        <div style={{ maxHeight: '650px', overflowY: 'auto', padding: '8px' }}>
          {isLoadingModalPosts ? (
            <div className="flex justify-center"><Spin /></div>
          ) : (
            <PostList
              loading={false}
              posts={modalPosts}
              loadMorePosts={fetchNonAdPosts}
              user={{ id: user?.id || '', name: '', family_name: '', avatar_url: '' }}
              fetchUserPosts={fetchNonAdPosts}
              hasMore={modalPosts.length % 10 === 0}
              setPosts={setModalPosts}
            />
          )}
        </div>
      </Modal>

      <div className="mb-6">
        <input
          type="text"
          placeholder={localStrings.Ads.SearchAds}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && filteredAds.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : filteredAds.length === 0 ? (
        <p className="text-center text-gray-500 text-lg py-10">{localStrings.Ads.NoAdsFound}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoadingPostDetails ? (
            <div className="flex justify-center items-center col-span-full h-64">
              <Spin size="large" />
            </div>
          ) : (
            filteredAds.map((ad: AdvertisePostResponseModel, index) => {
              const post = postDetails[ad.post_id!];
              const dotColor = ad.isActive ? 'bg-green-500' : 'bg-gray-500';
              const textColor = ad.isActive ? 'text-green-600' : 'text-gray-600';

              return (
                <div
                  key={ad.id || index}
                  className="group p-6 rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer hover:border-blue-300"
                  onClick={() => openModal(ad)}
                >
                  <div
                    className="w-full max-w-full flex justify-center items-center rounded-lg overflow-hidden bg-gray-50"
                    style={{ height: '180px' }}
                  >
                    {post && (post.is_advertisement === 1 || post.is_advertisement === 2) ? (
                      <div className="w-full h-full flex flex-col justify-between p-2">
                        {post.content && (
                          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                            {post.content}
                          </h3>
                        )}
                        {post.media && post.media.length > 0 && post.media.map((media: { media_url: string }, index: number) => {
                          const isVideo = /\.(mp4|webm|ogg)$/i.test(media.media_url);
                          return isVideo ? (
                            <video
                              key={index}
                              src={media.media_url}
                              controls
                              className="w-full h-24 object-cover rounded-md mt-2"
                            />
                          ) : (
                            <img
                              key={index}
                              src={media.media_url}
                              alt={post.content || 'Ad Image'}
                              className="w-full h-24 object-cover rounded-md mt-2"
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <Spin tip="Loading post..." />
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${dotColor} ${ad.isActive ? 'animate-pulse' : ''}`} />
                      <span className={`${textColor} font-medium text-sm`}>
                        {ad.isActive ? localStrings.Ads.ActiveCampaign : localStrings.Ads.Campaign}
                      </span>
                    </div>
                    {ad.isActive ? (
                      <div className="mt-2 text-xs text-gray-700 space-y-1">
                        <p><span className="font-semibold">{localStrings.Ads.Campaign}:</span> #{index + 1}</p>
                        <p><span className="font-semibold">{localStrings.Ads.DaysAds}:</span> {DateTransfer(ad.start_date)}</p>
                        <p><span className="font-semibold">{localStrings.Ads.End}:</span> {DateTransfer(ad.end_date)}</p>
                        <p><span className="font-semibold">{localStrings.Ads.RemainingTime}:</span> {ad.day_remaining} days</p>
                        {ad.bill?.price !== undefined && (
                          <p><span className="font-semibold">{localStrings.Ads.Grant}:</span> {CurrencyFormat(ad.bill.price)}</p>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-full py-1.5 text-xs text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200">
                      {localStrings.Ads.ViewDetails}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button type="primary" onClick={handleLoadMore} loading={loading}>
            {localStrings.Public.LoadMore}
          </Button>
        </div>
      )}

      {selectedAd && <AdDetailsModal ad={selectedAd} onClose={closeModal} post={postDetails[selectedAd.post_id!]} />}
    </div>
  );
};

export default AdsManagementFeature;