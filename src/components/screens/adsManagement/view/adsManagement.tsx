"use client";

import { useState, useEffect } from "react";
import { FaFileExport } from "react-icons/fa";
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Modal, Spin, Button } from 'antd';
import ProfileViewModel from "@/components/screens/profile/viewModel/ProfileViewModel";
import PostList from "@/components/screens/profile/components/PostList";
import { AdvertisePostResponseModel } from "@/api/features/post/models/AdvertisePostModel";
import { DateTransfer } from "@/utils/helper/DateTransfer";
import { CurrencyFormat } from "@/utils/helper/CurrencyFormat";
import useAdsManagement from "../viewModel/adsManagementViewModel";
import Post from "@/components/common/post/views/Post";
import AdsViewModel from "@/components/screens/ads/viewModel/AdsViewModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import dayjs from 'dayjs';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Modal component
const AdDetailsModal = ({ ad, onClose }: { ad: AdvertisePostResponseModel; onClose: () => void }) => {
    const data = {
        labels: ad.labels || [],
        datasets: [
            {
                label: 'Results',
                data: ad.resultsData || [],
                borderColor: '#3498db',
                fill: false,
                tension: 0.3,
            },
            {
                label: 'Reach',
                data: ad.reachData || [],
                borderColor: '#2ecc71',
                fill: false,
                tension: 0.3,
            },
            {
                label: 'Impressions',
                data: ad.impressionsData || [],
                borderColor: '#e67e22',
                fill: false,
                tension: 0.3,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Value' }, beginAtZero: true },
        },
        plugins: {
            legend: { position: 'top' as const, labels: { boxWidth: 10, padding: 10 } },
            tooltip: { mode: 'index' as const, intersect: false },
        },
    };

    const handleCloseModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };

    const { getPostDetail, post } = AdsViewModel(defaultPostRepo);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (ad.post_id) {
                setLoading(true);
                await getPostDetail(ad.post_id);
                setLoading(false);
            }
        };
        fetchData();
    }, [ad.post_id]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-2xl w-11/12 max-w-4xl relative" onClick={(e) => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" onClick={handleCloseModal}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/2 flex justify-center items-center">
                        {loading ? <Spin /> : post && <Post post={post} noFooter />}
                    </div>
                    <div className="md:w-1/2 flex flex-col gap-2">
                        <h2 className="text-xl font-bold text-center text-gray-800">{ad.post_id}</h2>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong>Status:</strong> {ad.status || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong>Start:</strong> {ad.start_date ? DateTransfer(ad.start_date) : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong>End:</strong> {ad.end_date ? DateTransfer(ad.end_date) : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong>Days:</strong> {ad.day_remaining !== undefined ? ad.day_remaining : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong>Price:</strong> {ad.bill?.price !== undefined ? CurrencyFormat(ad.bill.price) : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong>Bill Status:</strong> {ad.bill?.status || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-700">
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong>Total Results:</strong> {ad.resultsData?.reduce((sum, num) => sum + num, 0) || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong>Total Reach:</strong> {ad.reachData?.reduce((sum, num) => sum + num, 0) || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong>Total Impressions:</strong> {ad.impressionsData?.reduce((sum, num) => sum + num, 0) || 0}</p>
                            </div>
                        </div>
                        <div className="h-[250px]">
                            <Line data={data} options={options} />
                        </div>
                    </div>
                </div>
                <div className="mt-2 text-center">
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={handleCloseModal}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdsManagementFeature = () => {
    const { 
        loading, 
        ads, 
        error, 
        fetchAds, 
        deleteAd, 
        loadMoreAds, 
        page, 
        setPage, 
        getPostDetail,
        postDetail 
    } = useAdsManagement();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAds, setFilteredAds] = useState<AdvertisePostResponseModel[]>([]);
    const [selectedAd, setSelectedAd] = useState<AdvertisePostResponseModel | null>(null);
    const [isPostListModalVisible, setIsPostListModalVisible] = useState(false);
    const { fetchUserPosts, posts, setPosts } = ProfileViewModel();
    const [postLoading, setPostLoading] = useState<boolean>(false);
    const [currentPostId, setCurrentPostId] = useState<string | null>(null);

    useEffect(() => {
        if (isPostListModalVisible) {
            fetchUserPosts();
        }
    }, [isPostListModalVisible, fetchUserPosts]);

    useEffect(() => {
        fetchAds();
    }, [fetchAds]);

    useEffect(() => {
        const filter = ads.filter((ad: AdvertisePostResponseModel) =>
            ad.post_id?.toLowerCase().includes(searchTerm.toLowerCase()) || ''
        );
        setFilteredAds(filter);
    }, [searchTerm, ads]);

    const openModal = (ad: AdvertisePostResponseModel) => {
        setSelectedAd(ad);
    };

    const closeModal = () => {
        setSelectedAd(null);
    };

    const isAdActive = (ad: AdvertisePostResponseModel): boolean => {
        if (ad.bill?.status !== 'success') return false;
        const now = dayjs();
        const end = dayjs(ad.end_date, 'DD/MM/YYYY');
        return now.isBefore(end);
    };

    useEffect(() => {
        return () => {
            setSelectedAd(null);
        };
    }, []);

    const handleLoadMore = () => {
        loadMoreAds();
    };

    const handleGetPostDetail = async (postId: string) => {
        setPostLoading(true);
        setCurrentPostId(postId);
        await getPostDetail(postId);
        setPostLoading(false);
    };

    useEffect(() => {
        if (ads.length > 0) {
            ads.forEach(async (ad) => {
                if (ad.post_id && (!postDetail || postDetail.id !== ad.post_id) && !currentPostId) {
                    await handleGetPostDetail(ad.post_id);
                }
            });
        }
    }, [ads]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold text-gray-800">Ads Management</h1>
                <div className="flex gap-3">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                        onClick={() => setIsPostListModalVisible(true)}
                    >
                        Create New Ad
                    </button>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700">
                        <FaFileExport /> Export
                    </button>
                </div>
            </div>

            <Modal
                title={<div style={{ textAlign: "center", fontSize: 24, fontWeight: "bold" }}>Chọn bài viết cho quảng cáo</div>}
                open={isPostListModalVisible}
                onCancel={() => setIsPostListModalVisible(false)}
                footer={null}
                width={700}
                centered
                bodyStyle={{ maxHeight: '700px', overflowY: 'auto', padding: '16px' }}
            >
                <div style={{ maxHeight: '650px', overflowY: 'auto', padding: '8px' }}>
                    <PostList
                        loading={false}
                        posts={posts}
                        loadMorePosts={fetchUserPosts}
                        user={{ id: '', name: '', family_name: '', avatar_url: '' }}
                        fetchUserPosts={fetchUserPosts}
                        hasMore={false}
                        setPosts={setPosts}
                    />
                </div>
            </Modal>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search ads..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center"><Spin /></div>
            ) : filteredAds.length === 0 ? (
                <p className="text-center text-gray-500">No ads found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAds.map((ad: AdvertisePostResponseModel, index) => (
                        <div
                            key={ad.id || index}
                            className="p-5 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-200 cursor-pointer"
                            onClick={() => openModal(ad)}
                        >
                            <div className="flex justify-center items-center">
                                {postLoading && currentPostId === ad.post_id ? <Spin /> : 
                                    postDetail && postDetail.id === ad.post_id ?
                                        <Post post={postDetail} noFooter /> : null}
                            </div>
                            {isAdActive(ad) && (
                                <div className="mt-2">
                                    <div className="flex items-center">
                                        <div style={{ height: 10, width: 10, backgroundColor: "green", borderRadius: 5, marginRight: 5 }} />
                                        <span className="text-green-600 font-semibold">Active Campaign</span>
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-gray-600">Campaign #{index + 1}</span>
                                    </div>
                                    <div className="text-gray-600">Start: {ad.start_date}</div>
                                    <div className="text-gray-600">End: {ad.end_date}</div>
                                    <div className="text-gray-600">Days Remaining: {ad.day_remaining}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {ads.length % 10 === 0 && ads.length !== 0 && (
                <div className="flex justify-center mt-4">
                    <Button type="primary" onClick={handleLoadMore} loading={loading}>
                        Load more
                    </Button>
                </div>
            )}
            {selectedAd && <AdDetailsModal ad={selectedAd} onClose={closeModal} />}
        </div>
    );
};

export default AdsManagementFeature;