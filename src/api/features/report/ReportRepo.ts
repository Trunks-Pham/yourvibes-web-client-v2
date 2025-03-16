import { ApiPath } from "@/api/ApiPath";
import { ReportRequestModel } from "../report/models/ReportRequestModel";
import { BaseApiResponseModel } from "@/api/baseApiResponseModel/baseApiResponseModel";
import client from "@/api/client";
import { AxiosError } from "axios"; // Import AxiosError

interface IReportRepo {
    report(params: ReportRequestModel): Promise<BaseApiResponseModel<ReportRequestModel>>;
}

export class ReportRepo implements IReportRepo {
    async report(params: ReportRequestModel): Promise<BaseApiResponseModel<ReportRequestModel>> {
        try {
            const response = await client.post<BaseApiResponseModel<ReportRequestModel>>(ApiPath.REPORT, params);
            return response.data; // Return only the data part
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Error in ReportRepo:", axiosError);
            throw axiosError; // Re-throw the error to be handled by the caller
        }
    }
}

export const defaultReportRepo = new ReportRepo();
