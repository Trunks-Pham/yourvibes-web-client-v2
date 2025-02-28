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
                { id: 1, content: "YourVibes Ad 1", active: true, status: "running" as "running", results: 913, reach: 31048, impressions: 79522, cost: 0.19, startDate: "2024-02-20", endDate: "2024-02-25", daysRemaining: 5 },
                { id: 2, content: "YourVibes Ad 2", active: true, status: "successful" as "successful", results: 1497, reach: 48047, impressions: 104345, cost: 0.28, startDate: "2024-02-21", endDate: "2024-02-26", daysRemaining: 6 },
                { id: 3, content: "YourVibes Ad 3", active: false, status: "paused" as "paused", results: 2300, reach: 60000, impressions: 150000, cost: 0.25, startDate: "2024-02-22", endDate: "2024-02-27", daysRemaining: 7 },
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
