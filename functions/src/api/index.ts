import * as express from "express";
import * as cors from "cors";
import {https} from "firebase-functions";
import {exportMarket, exportMarketItem} from "./exportCsv";
import {middleware as apicache} from "apicache";

import type {Firestore} from "firebase-admin/firestore";
import type {HttpsFunction} from "firebase-functions";

/**
 * It creates an express app, adds CORS and two routes,
 * and then returns an https function that uses the express app
 * @param {Firestore} fs - Firestore
 * @return {HttpsFunction} A function that takes a request and response object.
 */
export function apiServiceFactory(fs: Firestore): HttpsFunction {
  const app = express();
  const cache = apicache;
  app.use(cors({origin: true}));
  app.get("*/export-market-live/:region",
      cache("30 minutes"),
      async (req, res) =>
        exportMarket(fs, req, res)
  );
  app.get("*/export-item-history/:region/:item",
      cache("1 day"),
      async (req, res) =>
        exportMarketItem(fs, req, res)
  );
  return https.onRequest(app);
}
