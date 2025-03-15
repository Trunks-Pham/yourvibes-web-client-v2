import { ApiPath } from "@/api/ApiPath";
import { ReportRequestModel } from "../report/models/ReportRequestModel";
import { BaseApiResponseModel } from "@/api/baseApiResponseModel/baseApiResponseModel";
import client from "@/api/client";
import { AxiosError } from "axios";

interface IReportRepo {
    report(params: ReportRequestModel): Promise<BaseApiResponseModel<ReportRequestModel>>;
}

export class ReportRepo implements IReportRepo {
    async report(params: ReportRequestModel): Promise<BaseApiResponseModel<ReportRequestModel>> {
        try {
            const response = await client.post<BaseApiResponseModel<ReportRequestModel>>(ApiPath.REPORT, params);
            // Kiểm tra nếu response không tồn tại hoặc không có data
            if (!response || !response.data) {
                throw new Error("Invalid API response: No data returned");
            }
            return response.data; // Trả về data nếu hợp lệ
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Error in ReportRepo:", axiosError);
            throw axiosError; // Ném lỗi để ViewModel xử lý
        }
    }
}

export const defaultReportRepo = new ReportRepo();