import { useState, useEffect } from "react";

interface Ad {
    id: number;
    content: string;
    active: boolean;
    status: "running" | "successful" | "paused";
    results: number;
    reach: number;
    impressions: number;
    cost: number;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    imageUrl: string;
    labels: string[];  // Add labels property
}

export const useAdsManagement = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    useEffect(() => {
        fetchAds();
    }, [startDate, endDate]);  // Fetch ads again if startDate or endDate change

    const fetchAds = () => {
        setTimeout(() => {
            const filteredAds = [
                {
                    id: 1,
                    content: "YourVibes Ad 1",
                    active: true,
                    status: "running" as "running",
                    results: 913,
                    reach: 31048,
                    impressions: 79522,
                    cost: 0.19,
                    startDate: "2024-02-20",
                    endDate: "2024-02-25",
                    daysRemaining: 5,
                    imageUrl: "https://cdn.brvn.vn/editor/2023/09/U92882_quang-cao-la-gi_1695692802.jpg",
                    labels: ["label1", "label2"],
                    dates: ["2024-02-20", "2024-02-21", "2024-02-22", "2024-02-23", "2024-02-24", "2024-02-25"],
                    resultsData: [50, 100, 150, 200, 250, 913],  // Example of increasing results
                    reachData: [5000, 7000, 9000, 12000, 15000, 31048],  // Increasing reach over time
                    impressionsData: [10000, 15000, 20000, 25000, 30000, 79522],  // Increasing impressions
                },
                {
                    id: 2,
                    content: "YourVibes Ad 2",
                    active: true,
                    status: "successful" as "successful",
                    results: 1497,
                    reach: 48047,
                    impressions: 104345,
                    cost: 0.28,
                    startDate: "2024-02-21",
                    endDate: "2024-02-26",
                    daysRemaining: 6,
                    imageUrl: "https://cdn.brvn.vn/editor/2023/09/U92882_quang-cao-la-gi_1695692802.jpg",
                    labels: ["label3", "label4"],
                    dates: ["2024-02-21", "2024-02-22", "2024-02-23", "2024-02-24", "2024-02-25", "2024-02-26"],
                    resultsData: [70, 150, 250, 400, 600, 1497],
                    reachData: [7000, 9000, 12000, 15000, 18000, 48047],
                    impressionsData: [15000, 25000, 35000, 45000, 55000, 104345],
                },
                {
                    id: 3,
                    content: "YourVibes Ad 3",
                    active: false,
                    status: "paused" as "paused",
                    results: 0,
                    reach: 0,
                    impressions: 0,
                    cost: 0,
                    startDate: "2024-02-22",
                    endDate: "2024-02-27",
                    daysRemaining: 7,
                    imageUrl: "https://cdn.brvn.vn/editor/2023/09/U92882_quang-cao-la-gi_1695692802.jpg",
                    labels: ["label5", "label6"],
                    dates: ["2024-02-22", "2024-02-23", "2024-02-24", "2024-02-25", "2024-02-26", "2024-02-27"],
                    resultsData: [0, 0, 0, 0, 0, 0],
                    reachData: [0, 0, 0, 0, 0, 0],
                    impressionsData: [0, 0, 0, 0, 0, 0],
                },
            ].filter((ad) => {
                const adStartDate = new Date(ad.startDate).getTime();
                const adEndDate = new Date(ad.endDate).getTime();
                const startDateValue = startDate ? new Date(startDate).getTime() : null;
                const endDateValue = endDate ? new Date(endDate).getTime() : null;

                // Filter ads based on start and end dates
                if (startDateValue && adEndDate < startDateValue) return false;  // Ad ends before the start date
                if (endDateValue && adStartDate > endDateValue) return false;  // Ad starts after the end date

                return true;
            });

            setAds(filteredAds);
        }, 500);
    };


    const deleteAd = (id: number) => {
        setAds((prevAds) => prevAds.filter((ad) => ad.id !== id));
    };

    const filterAds = (status: "running" | "successful" | "paused") => {
        setAds((prevAds) => prevAds.filter((ad) => ad.status === status));
    };

    return { ads, fetchAds, deleteAd, filterAds, startDate, setStartDate, endDate, setEndDate };
};

export default useAdsManagement;