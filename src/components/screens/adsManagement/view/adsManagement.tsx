"use client";
import { useState, useEffect } from "react";
import { useAdsManagement } from "../viewModel/adsManagementViewModel";
import { FaEdit, FaTrash, FaPlus, FaFileExport } from "react-icons/fa";
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Post from '@/components/common/post/views/Post';
import { Modal, Empty } from 'antd';
import { PostResponseModel } from "@/api/features/post/models/PostResponseModel";
import ProfileViewModel from "@/components/screens/profile/viewModel/ProfileViewModel";
import PostList from "@/components/screens/profile/components/PostList";

// Register the required components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Modal component
const AdDetailsModal = ({ ad, onClose }: { ad: any; onClose: () => void }) => {
    const data = {
        labels: ad.dates,
        datasets: [
            {
                label: 'Results',
                data: ad.resultsData,
                borderColor: 'blue',
                fill: false,
            },
            {
                label: 'Reach',
                data: ad.reachData,
                borderColor: 'green',
                fill: false,
            },
            {
                label: 'Impressions',
                data: ad.impressionsData,
                borderColor: 'red',
                fill: false,
            },
        ],
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl relative flex" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}>
                    &times;
                </button>

                {/* Left Side - Image */}
                <div className="w-1/2 flex justify-center items-center p-4">
                    <img src={ad.imageUrl} alt={ad.content} className="w-full h-auto max-h-96 object-cover rounded-md shadow-md" />
                </div>

                {/* Right Side - Content */}
                <div className="w-1/2 flex flex-col justify-between p-4">
                    <h2 className="text-2xl font-semibold mb-4 text-center">{ad.content}</h2>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                        <p><strong>Status:</strong> {ad.status}</p>
                        <p><strong>Start Date:</strong> {ad.startDate}</p>
                        <p><strong>End Date:</strong> {ad.endDate}</p>
                        <p><strong>Days Remaining:</strong> {ad.daysRemaining}</p>
                        <p><strong>Results:</strong> {ad.results}</p>
                        <p><strong>Reach:</strong> {ad.reach}</p>
                        <p><strong>Impressions:</strong> {ad.impressions}</p>
                        <p><strong>Cost:</strong> ${ad.cost}</p>
                    </div>

                    {/* Chart Section */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2 text-center">Performance Over Time</h3>
                        <Line data={data} />
                    </div>

                    {/* Close Button */}
                    <div className="mt-6 text-right mr-4">
                        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700" onClick={onClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdsManagementFeature = () => {
    const { ads, fetchAds, deleteAd } = useAdsManagement();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAds, setFilteredAds] = useState(ads);
    const [selectedAd, setSelectedAd] = useState<any | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPostListModalVisible, setIsPostListModalVisible] = useState(false);
    const { fetchUserPosts, posts, setPosts } = ProfileViewModel();

    useEffect(() => {
        if (isPostListModalVisible) {
            fetchUserPosts();
        }
    }, [isPostListModalVisible]);


    useEffect(() => {
        fetchAds();
    }, []);

    useEffect(() => {
        setFilteredAds(
            ads.filter((ad) => ad.content.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, ads]);

    const openModal = (ad: any) => {
        setSelectedAd(ad);
    };

    const closeModal = () => {
        setSelectedAd(null);
    };

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
                title="Select a Post for Ad"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
            >
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post.id} className="p-3 border rounded-lg mb-3 cursor-pointer hover:bg-gray-100">
                                <Post post={post} />
                            </div>
                        ))
                    ) : (
                        <Empty description="No Posts Available" />
                    )}
                </div>
            </Modal>

            <Modal title={
                <div style={{ textAlign: "center", fontSize: 24, fontWeight: "bold" }}>
                    Chọn bài viết cho quảng cáo
                </div>
            }
                open={isPostListModalVisible}
                onCancel={() => setIsPostListModalVisible(false)}
                footer={null}
                width={700} // Độ rộng cố định
                centered
                bodyStyle={{ maxHeight: '700px', overflowY: 'auto', padding: '16px' }} // Giữ modal gọn hơn
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
                        noFooter={true}
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

            {filteredAds.length === 0 ? (
                <p className="text-center text-gray-500">No ads found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAds.map((ad) => (
                        <div
                            key={ad.id}
                            className="p-5 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-200 cursor-pointer"
                            onClick={() => openModal(ad)} // Open modal on ad card click
                        >
                            <img src={ad.imageUrl} alt={ad.content} className="w-full h-32 object-cover rounded-md mb-4" />
                            <h2 className="font-semibold">{ad.content}</h2>
                            <p className="text-gray-600">Status: <span className="font-semibold">{ad.status}</span></p>
                            <p className="text-gray-600">Start Date: <span className="font-semibold">{ad.startDate}</span></p>
                            <p className="text-gray-600">Cost: <span className="font-semibold">${ad.cost}</span></p>
                            <div className="flex justify-between items-center mt-4">
                                <button className="text-blue-500 hover:text-blue-700">
                                    <FaEdit size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for displaying full ad details */}
            {selectedAd && <AdDetailsModal ad={selectedAd} onClose={closeModal} />}
        </div>
    );
};

export default AdsManagementFeature;