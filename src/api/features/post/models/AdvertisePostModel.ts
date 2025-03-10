import { PostMediaModel } from "./PostResponseModel";
export interface AdvertisePostRequestModel {
  post_id?: string;
  start_date?: string;
  end_date?: string;
  redirect_url?: string;
}

export interface GetAdvertiseRequestModel {
  post_id?: string;
  page?: number;
  limit?: number;
}

export interface AdvertisePostResponseModel {
  [x: string]: any;
  id?: string;
  post_id?: string;
  start_date?: string;
  end_date?: string;
  bill?: BillModel;
  day_remaining?: number;
  status?: string;
  resultsData: number[]; 
  reachData: number[]; 
  impressionsData: number[];
  labels: string[];
  is_advertisement: boolean;
}

export interface BillModel {
  id?: string;
  advertise_id?: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
  status?: string;  
}