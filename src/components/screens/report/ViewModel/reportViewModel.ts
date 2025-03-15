import { defaultReportRepo } from "@/api/features/report/ReportRepo";
import { ReportRequestModel } from "@/api/features/report/models/ReportRequestModel";
import { useAuth } from "@/context/auth/useAuth";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiosError } from "axios";

const ReportViewModel = () => {
    const router = useRouter();
    const { localStrings } = useAuth();
    const [reportLoading, setReportLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const report = async (params: ReportRequestModel) => {
        try {
            setReportLoading(true);
            const res = await defaultReportRepo.report(params);
            console.log("Response from API:", res);

            // Kiểm tra nếu res không có error
            if (!res?.error) {
                message.success(localStrings.Report.ReportSuccess);
                return { success: true, data: res }; // Trả về kết quả thành công
            } else {
                let errorMessage = localStrings.Report.ReportFailed;
                if (params.type === 0) {
                    errorMessage = localStrings.Report.ReportUserFailed;
                } else if (params.type === 1) {
                    errorMessage = localStrings.Report.ReportPostFailed;
                } else if (params.type === 2) {
                    errorMessage = localStrings.Report.ReportCommentFailed;
                }
                message.error(errorMessage);
                return { success: false, error: errorMessage }; // Trả về lỗi
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Error in ReportViewModel:", axiosError);
            if (axiosError.code === "ERR_NETWORK") {
                message.error("Network Error");
            } else {
                message.error(localStrings.Report.ReportFailed);
            }
            return { success: false, error: axiosError.message }; // Trả về lỗi
        } finally {
            setReportLoading(false);
        }
    };

    return {
        reportLoading,
        report,
        setShowModal,
        showModal,
    };
};

export default ReportViewModel;