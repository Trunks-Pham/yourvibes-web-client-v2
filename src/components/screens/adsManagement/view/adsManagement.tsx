"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FaFileExport } from "react-icons/fa";
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Modal, Spin, Button } from 'antd';
import ProfileViewModel from "@/components/screens/profile/viewModel/ProfileViewModel";
import PostList from "@/components/screens/profile/components/PostList";
import { DateTransfer } from "@/utils/helper/DateTransfer";
import { CurrencyFormat } from "@/utils/helper/CurrencyFormat";
import useAdsManagement from "../viewModel/adsManagementViewModel";
import Post from "@/components/common/post/views/Post";
import AdsViewModel from "@/components/screens/ads/viewModel/AdsViewModel";
import { defaultPostRepo } from "@/api/features/post/PostRepo";
import dayjs from 'dayjs';
import { AdvertisePostResponseModel } from "@/api/features/post/models/AdvertisePostModel";

// Register the required components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Modal component
const AdDetailsModal = ({ ad, onClose }: { ad: AdvertisePostResponseModel; onClose: () => void }) => {
    const data = {
        labels: ad.labels,
        datasets: [
            {
                label: 'Results',
                data: ad.resultsData,
                borderColor: '#3498db', // Blue
                fill: false,
                tension: 0.3,
            },
            {
                label: 'Reach',
                data: ad.reachData,
                borderColor: '#2ecc71', // Green
                fill: false,
                tension: 0.3,
            },
            {
                label: 'Impressions',
                data: ad.impressionsData,
                borderColor: '#e67e22', // Orange
                fill: false,
                tension: 0.3,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5, // Adjust aspect ratio for a smaller chart
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Value',
                },
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    boxWidth: 10, // Smaller legend box
                    padding: 10, // Less padding
                },
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
    };
    const handleCloseModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    }

    const { getPostDetail, post } = AdsViewModel(defaultPostRepo)
    const [loading, setLoading] = useState(false);
    const postRef = useRef<any>(null);
    useEffect(() => {
        const fetchData = async () => {
            if (ad.postId && !postRef.current) {
                setLoading(true);
                const res = await getPostDetail(ad.postId);
                postRef.current = res;
                setLoading(false);
            }
        };
        fetchData();
    }, [ad.postId, getPostDetail]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-xl shadow-2xl w-11/12 max-w-4xl relative" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none" onClick={handleCloseModal}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Image */}
                    <div className="md:w-1/2 flex justify-center items-center">
                        {/*Replaced img by Post Component*/}
                        {loading ? <Spin /> : postRef.current && <Post post={postRef.current} noFooter />}
                    </div>
                    {/* Details */}
                    <div className="md:w-1/2 flex flex-col gap-2">
                        <div className="flex justify-center items-center">
                            <h2 className="text-xl font-bold text-center text-gray-800">{ad.content}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong className="text-gray-800">Status:</strong> {ad.status || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong className="text-gray-800">Start:</strong> {ad.startDate ? DateTransfer(ad.startDate) : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong className="text-gray-800">End:</strong> {ad.endDate ? DateTransfer(ad.endDate) : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong className="text-gray-800">Days:</strong> {ad.daysRemaining !== undefined ? ad.daysRemaining : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong className="text-gray-800">Price:</strong> {ad.price !== undefined ? CurrencyFormat(ad.price) : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p><strong className="text-gray-800">Bill Status:</strong> {ad.billStatus || 'N/A'}</p>
                            </div>
                        </div>
                        {/* Display stats from chart data */}
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-700">
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p>
                                    <strong className="text-gray-800">Total Results:</strong>{' '}
                                    {ad.resultsData.reduce((sum: number, num: number) => sum + num, 0)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p>
                                    <strong className="text-gray-800">Total Reach:</strong>{' '}
                                    {ad.reachData.reduce((sum: number, num: number) => sum + num, 0)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                <p>
                                    <strong className="text-gray-800">Total Impressions:</strong>{' '}
                                    {ad.impressionsData.reduce((sum: number, num: number) => sum + num, 0)}
                                </p>
                            </div>
                        </div>
                        <div className="h-[250px]">
                            <Line data={data} options={options} />
                        </div>
                    </div>
                </div>
                <div className="mt-2 text-center">
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none" onClick={handleCloseModal}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdsManagementFeature = () => {
    const { loading, ads, error, fetchAds, deleteAd, loadMoreAds, page, setPage, getPostDetail, postDetail } = useAdsManagement();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAds, setFilteredAds] = useState<AdvertisePostResponseModel[]>([]);
    const [selectedAd, setSelectedAd] = useState<AdvertisePostResponseModel | null>(null);
    const [isPostListModalVisible, setIsPostListModalVisible] = useState(false);
    const { fetchUserPosts, posts, setPosts } = ProfileViewModel(); // Removed isLoading
    const [postLoading, setPostLoading] = useState<boolean>(false);
    const [currentPostId, setCurrentPostId] = useState<string | null>(null);
    const [postDetailsCache, setPostDetailsCache] = useState<{ [postId: string]: any }>({});

    const memoizedFetchAds = useCallback(fetchAds, []);
    const postDetailRefs = useRef<{ [key: string]: any }>({})

    useEffect(() => {
        if (isPostListModalVisible) {
            fetchUserPosts();
        }
    }, [isPostListModalVisible, fetchUserPosts]);

    useEffect(() => {
        memoizedFetchAds();
    }, [memoizedFetchAds])

    //Consolidate filtering logic
    useEffect(() => {
        const filter = ads.filter((ad: AdvertisePostResponseModel) =>
            ad.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredAds(filter);
    }, [searchTerm, ads]);

    const openModal = (ad: AdvertisePostResponseModel) => {
        setSelectedAd(ad);
    };

    const closeModal = () => {
        setSelectedAd(null);
    };

    // Function to check if an ad is active
    const isAdActive = (ad: AdvertisePostResponseModel): boolean => {
        if (ad.billStatus !== 'success') {
            return false
        }
        const now = dayjs();
        const end = dayjs(ad.endDate, 'DD/MM/YYYY');
        return now.isBefore(end);
    };

    useEffect(() => {
        return () => {
            setSelectedAd(null)
        };
    }, []);

    const handleLoadMore = () => {
        loadMoreAds();
    }
    const handleGetPostDetail = async (postId: string) => {
        if (!postDetailRefs.current[postId]) {
            setPostLoading(true)
            setCurrentPostId(postId);
            try {
                const postData = await getPostDetail(postId);
                postDetailRefs.current[postId] = postData
                setPostDetailsCache((prevCache) => ({
                    ...prevCache,
                    [postId]: postData,
                }));
            } finally {
                setPostLoading(false);
            }
        }
    }

    useEffect(() => {
        if (ads.length > 0) {
            const fetchAllPostDetail = async () => {
                const promises = ads.map(async (ad) => {
                    if (ad.postId && !postDetailRefs.current[ad.postId]) {
                        await handleGetPostDetail(ad.postId)
                    }
                })
                await Promise.all(promises);
            }
            fetchAllPostDetail();

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
                    > Create New Ad
                    </button>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-all">
                        <FaFileExport /> Export
                    </button>
                </div>
            </div>

            <Modal
                title={
                    <div style={{ textAlign: "center", fontSize: 24, fontWeight: "bold" }}>
                        Chọn bài viết cho quảng cáo
                    </div>
                }
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

            {loading ? (<div className="flex justify-center"><Spin /></div>) :
                filteredAds.length === 0 ? (
                    <p className="text-center text-gray-500">No ads found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredAds.map((ad: AdvertisePostResponseModel, index) => (
                            <div
                                key={ad.id}
                                className="p-5 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-200 cursor-pointer w-[300px] h-[300px] overflow-hidden"
                                onClick={() => openModal(ad)}
                            >

                                {/* Image */}
                                <div className=" flex justify-center items-center">
                                    {/*Replaced img by Post Component*/}
                                    {postLoading && currentPostId === ad.postId ? <Spin /> :
                                        postDetailRefs.current[ad.postId] ?
                                            <Post post={postDetailRefs.current[ad.postId]} noFooter /> : null}
                                </div>

                                {isAdActive(ad) && (
                                    <div className="mt-2">
                                        <div className="flex items-center">
                                            <div
                                                style={{
                                                    height: 10,
                                                    width: 10,
                                                    backgroundColor: "green",
                                                    borderRadius: 5,
                                                    marginRight: 5,
                                                }}
                                            />
                                            <span className="text-green-600 font-semibold">Active Campaign</span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-gray-600">Campaign #{index + 1}</span>
                                        </div>
                                        <div className="text-gray-600">
                                            Start:  {ad.startDate}
                                        </div>
                                        <div className="text-gray-600">
                                            End: {ad.endDate}
                                        </div>
                                        <div className="text-gray-600">
                                            Days Remaining: {ad.daysRemaining}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            {/* Load more button */}
            {ads.length % 10 === 0 && ads.length !== 0 ? (
                <div className="flex justify-center mt-4">
                    <Button type="primary" onClick={handleLoadMore} loading={loading}>
                        Load more
                    </Button>
                </div>
            ) : null}

            {selectedAd && (
                <AdDetailsModal ad={selectedAd} onClose={closeModal} />
            )}
        </div>
    );
};

export default AdsManagementFeature;
