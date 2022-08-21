import {Request, Response} from "express";
import {
  DocumentData,
  Firestore,
  Query,
  FieldPath,
} from "firebase-admin/firestore";
import {Parser} from "json2csv";

/**
/* A generator function that returns an array of arrays of size n.
 * @param {T[]} arr The base array
 * @param {number} n The size of the chunks
 */
function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

/**
 * Get specific item docs from the live market
 * @param {Firestore} firestore The firestore app instance.
 * @param {string} collection The collection
 * @param {string[]} itemsIds The item ids
 * @param {string|FieldPath} filterParam Where to filter in
 * @return {DocumentData[]} docs array
 */
async function _getItems(
    firestore:Firestore,
    collection : string,
    itemsIds: string[],
    filterParam: string|FieldPath = FieldPath.documentId()
): Promise<DocumentData[]> {
  const idChunks = [...chunks(itemsIds, 10)];
  const docs = [];
  for (const idChunk of idChunks) {
    const result = await firestore.collection(collection)
        .where(filterParam, "in", idChunk).get();
    docs.push(...result.docs);
  }
  return docs;
}

/**
 * Export Market live data
 * @param {Firestore} firestore The firestore app instance.
 * @param {Request} req The express request.
 * @param {Response} res The express response.
 * @return {Response} Market Live data.
 */
export async function exportMarket(
    firestore: Firestore,
    req: Request,
    res: Response
): Promise<Response> {
  const {region} = req.params;
  const {
    format,
    category,
    subcategory,
    categories,
    items,
    ids,
    search,
  } = req.query;
  if (!category && !subcategory && !categories && !items && !ids && !search) {
    return res.status(400).send(
        "You need to specify a filter: "+
        "category, subcategory, categories, items, ids or search"
    );
  }
  let docs: DocumentData[] = [];
  if (items) {
    docs = await _getItems(firestore, region, (items as string).split(","));
  } else if (ids) {
    docs = await _getItems(
        firestore, region, (ids as string).split(","), "gameCode");
  } else if (category) {
    let query: Query = firestore.collection(region);
    query = query.where("category", "==", category);
    if (subcategory) {
      query = query.where("subcategory", "==", subcategory);
    }
    if (req.query["class"]) {
      query = query.where("filterName", "==", "Class")
          .where("filter", "==", req.query["class"]);
    }
    if (req.query["tier"]) {
      query = query.where("filterName", "==", "Tier")
          .where("filter", "==", req.query["tier"]);
    }

    query = query.orderBy("searchName").orderBy("updatedAt");
    const snapshot = await query.get();
    docs = snapshot.docs;
  } else if (categories) {
    const catList = (categories as string).split(",");
    let query: Query = firestore.collection(region);
    query = query.where("category", "in", catList);
    query = query.orderBy("searchName").orderBy("updatedAt");
    const snapshot = await query.get();
    docs = snapshot.docs;
  } else if (search) {
    let query: Query = firestore.collection(region);
    query = query
        .where("searchName", ">=", (search as string).toLowerCase())
        .where("searchName", "<", (search as string).toLowerCase()
            .replace(/.$/, (c) => String.fromCharCode(c.charCodeAt(0) + 1)))
        .orderBy("searchName").orderBy("updatedAt");
    const snapshot = await query.get();
    docs = snapshot.docs;
  }
  if (docs.length==0) {
    return res.sendStatus(404);
  }
  const data = docs.map((doc) => ({
    id: doc.id,
    gameCode: doc.get("gameCode"),
    name: doc.get("name"),
    image:
      "https://www.lostarkmarket.online/assets/item_icons/" + doc.get("image"),
    avgPrice: doc.get("avgPrice"),
    lowPrice: doc.get("lowPrice"),
    recentPrice: doc.get("recentPrice"),
    cheapestRemaining: doc.get("cheapestRemaining"),
    amount: doc.get("amount"),
    rarity: doc.get("rarity"),
    category: doc.get("category"),
    subcategory: doc.get("subcategory"),
    shortHistoric: doc.get("shortHistoric"),
    updatedAt: doc.get("updatedAt")?.toDate(),
  }));
  if (format == "csv") {
    const parser = new Parser({
      fields: [
        "id",
        "gameCode",
        "name",
        "image",
        "avgPrice",
        "lowPrice",
        "recentPrice",
        "cheapestRemaining",
        "amount",
        "rarity",
        "updatedAt",
      ],
    });
    res.attachment(`${region}-${new Date().getTime()}.csv`);
    return res.send(parser.parse(data));
  }
  return res.json(data);
}

/**
 * Export Market Item Historical data
 * @param {Firestore} firestore The firestore app instance.
 * @param {Request} req The express request.
 * @param {Response} res The express response.
 * @return {Response} Market Item Historical data.
 */
export async function exportMarketItem(
    firestore: Firestore,
    req: Request,
    res: Response
): Promise<Response> {
  const {region, item} = req.params;
  const {format} = req.query;

  let docs = [];
  if (item) {
    docs = await _getItems(
        firestore, `${region}-historic`, (item as string).split(","));
  } else {
    return res.status(400).send("You need to specify one or many items");
  }
  let lastUpdate = 0;
  const data = docs.map((doc)=>doc.get("timeData").map((td:{
    open:number,
    high:number,
    low:number,
    close:number,
    timestamp: number
  })=>{
    const timestamp = td.timestamp;
    if (lastUpdate && lastUpdate > timestamp) {
      lastUpdate = timestamp;
    }
    return {
      id: doc.ref.id,
      open: td.open,
      high: td.high,
      low: td.low,
      close: td.close,
      timestamp: timestamp,
    };
  }));

  if (data.length == 0) {
    return res.sendStatus(404);
  } else {
    if (format == "csv") {
      const parser = new Parser({
        fields: ["id", "timestamp", "open", "close", "high", "low"],
      });
      res.attachment(
          `${region}-${item}-${lastUpdate}.csv`
      );
      return res.send(parser.parse(data.flat()));
    }
    return res.json(data);
  }
}
