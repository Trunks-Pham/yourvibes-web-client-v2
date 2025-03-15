import { defaultReportRepo } from "@/api/features/report/ReportRepo";
import { ReportRequestModel } from "@/api/features/report/models/ReportRequestModel";
import { useAuth } from "@/context/auth/useAuth";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ReportViewModel = () => {
    const router = useRouter();
    const { localStrings } = useAuth();
    const [reportLoading, setReportLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const report = async (params: ReportRequestModel) => {
        try {
            setReportLoading(true);
            const res = await defaultReportRepo.report(params);

            if (!res?.error) {
                message.success(localStrings.Report.ReportSuccess);
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
            }
            return res;
        } catch (error: any) {
            console.error(error);
            message.error(localStrings.Report.ReportFailed);
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
