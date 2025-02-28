"use client";

import { useEffect, useState } from "react";
import { useAdsManagement } from "../viewModel/adsManagementViewModel";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFileExport } from "react-icons/fa";

const AdsManagementFeature = () => {
    const { ads, fetchAds, deleteAd } = useAdsManagement();
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAds, setFilteredAds] = useState(ads);

    useEffect(() => {
        fetchAds();
    }, []);

    useEffect(() => {
        setFilteredAds(
            ads.filter((ad) => ad.content.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, ads]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-semibold text-gray-800">Ads Management</h1>
                <div className="flex gap-3">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all">
                        <FaPlus /> Create Ad
                    </button>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-all">
                        <FaFileExport /> Export
                    </button>
                </div>
            </div>

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
                            className="p-5 rounded-xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-200"
                        >
                            <h2 className="font-semibold">{ad.content}</h2>
                            <p className="text-gray-600">Status: <span className="font-semibold">{ad.status}</span></p>
                            <p className="text-gray-600">Start Date: <span className="font-semibold">{ad.startDate}</span></p>
                            <p className="text-gray-600">End Date: <span className="font-semibold">{ad.endDate}</span></p>
                            <p className="text-gray-600">Days Remaining: <span className="font-semibold">{ad.daysRemaining}</span></p>
                            <p className="text-gray-600">Results: <span className="font-semibold">{ad.results}</span></p>
                            <p className="text-gray-600">Reach: <span className="font-semibold">{ad.reach}</span></p>
                            <p className="text-gray-600">Impressions: <span className="font-semibold">{ad.impressions}</span></p>
                            <p className="text-gray-600">Cost: <span className="font-semibold">${ad.cost}</span></p> 
                            <div className="flex justify-between items-center mt-4">
                                <button className="text-blue-500 hover:text-blue-700">
                                    <FaEdit size={18} />
                                </button>
                                <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => deleteAd(ad.id)}
                                >
                                    <FaTrash size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdsManagementFeature;
