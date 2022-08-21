import {Timestamp, DocumentData} from "@google-cloud/firestore";

export interface OCLH{
  timestamp: number;
  open: number;
  close: number;
  low: number;
  high: number;
  interpolated: boolean;
}

export interface Entry extends DocumentData{
  lowPrice: number;
  recentPrice: number;
  cheapestRemaining: number;
  avgPrice: number;
  createdAt: Timestamp | Date;
}
