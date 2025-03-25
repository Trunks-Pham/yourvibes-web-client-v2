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
            if (res && (res.code === 200 || res.code === 20001)) {
                message.success(localStrings.Report.ReportSuccess);
                setShowModal(false);
                return res;
            } else { 
                // 0: User, 1: Post, 2: Comment
                // const errorMessage = res?.message || localStrings.Report.ReportFailed;
                // message.error(errorMessage);
                // setShowModal(false);
                // return res;
                if (params.type === 0 ){
                    const errorMessage = localStrings.Report.ReportUserFailed
                    message.error(errorMessage)
                } 
                if (params.type === 1){
                    const errorMessage = localStrings.Report.ReportPostFailed
                    message.error(errorMessage)
                }
                if (params.type === 2){
                    const errorMessage = localStrings.Report.ReportCommentFailed
                    message.error(errorMessage)
                }
                return res
            }
        } catch (error) {
            const axiosError = error as AxiosError; 
            const errorMessage = (axiosError.response?.data as any)?.message || localStrings.Report.ReportFailed;
            message.error(errorMessage);
            setShowModal(false);
            throw axiosError;
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