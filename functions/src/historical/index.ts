import {runWith} from "firebase-functions";
import * as pLimit from "p-limit";

import type {
  Timestamp,
  DocumentSnapshot,
  DocumentData,
} from "@google-cloud/firestore";
import type {Firestore} from "firebase-admin/firestore";
import type {CloudFunction} from "firebase-functions";
import type {Entry, OCLH} from "./interfaces";

/**
 * It takes a region and an item document, gets the latest historic snapshot,
 * gets all the new entries since the last update, groups them by hour,
 * fills in the gaps with interpolated values, and then
 * saves the new historic snapshot
 * @param {string} region - The region you want to process.
 * @param {any} itemDoc - The document of the item we're processing.
 * @param {Firestore} firestore - Firestore
 */
async function processHistoricalData(
    region: string,
    itemDoc: DocumentSnapshot<DocumentData>,
    firestore: Firestore
) {
  const currentItemHistoricSnapshot = await firestore
      .doc(`${region}-historic/${itemDoc.id}`)
      .get();

  let oldEntries: OCLH[] = [];
  let latestEntry: OCLH | undefined;
  let lastUpdate: Timestamp | undefined;
  if (currentItemHistoricSnapshot.exists) {
    oldEntries = currentItemHistoricSnapshot.get("timeData") || [];
    lastUpdate = currentItemHistoricSnapshot.get("updatedAt");
    latestEntry = oldEntries.sort(
        (a: OCLH, b: OCLH) => b.timestamp - a.timestamp
    )[0];
  }

  let newEntries: Entry[] = [];
  if (lastUpdate) {
    newEntries = (
      await itemDoc.ref
          .collection("entries")
          .where("createdAt", ">=", lastUpdate)
          .get()
    ).docs.map((d) => {
      const data = d.data();
      return {
        lowPrice: data.lowPrice,
        recentPrice: data.recentPrice,
        cheapestRemaining: data.cheapestRemaining,
        avgPrice: data.avgPrice,
        createdAt: data.createdAt,
      };
    });
  } else {
    newEntries = (await itemDoc.ref.collection("entries").get()).docs.map(
        (d) => {
          const data = d.data();
          return {
            lowPrice: data.lowPrice,
            recentPrice: data.recentPrice,
            cheapestRemaining: data.cheapestRemaining,
            avgPrice: data.avgPrice,
            createdAt: data.createdAt,
          };
        }
    );
  }
  if (newEntries.length == 0) {
    console.log(
        `${region} - ${currentItemHistoricSnapshot.id} : No new entries`
    );
    return;
  }

  const entries = newEntries
      .map((a) => ({...a, createdAt: (a.createdAt as Timestamp).toDate()}))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .reduce((acc: {[gatedTime: string]: Entry[]}, item: Entry) => {
        const gatedTime = new Date(
            Math.floor((item.createdAt as Date).getTime() / 3600000) * 3600000
        ).toISOString();
        if (!acc[gatedTime]) {
          acc[gatedTime] = [];
        }
        acc[gatedTime].push(item);
        return acc;
      }, {});

  let OCLHs = Object.keys(entries).reduce(
      (acc: {[gatedTime: string]: OCLH}, gatedTime: string) => {
        const item = entries[gatedTime];
        const subEntries = item.sort(
            (a: Entry, b: Entry) =>
              (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime()
        );
        const prices = subEntries.map((i) => i.lowPrice);
        acc[gatedTime] = {
          open: subEntries[0].lowPrice,
          close: subEntries[subEntries.length - 1].lowPrice,
          low: Math.min(...prices),
          high: Math.max(...prices),
          timestamp: new Date(gatedTime).getTime(),
          interpolated: false,
        };
        return acc;
      },
      {}
  );

  if (latestEntry) {
    OCLHs = {
      [new Date(latestEntry.timestamp).toISOString()]: latestEntry,
      ...OCLHs,
    };
  }

  const timeFrame = Object.keys(OCLHs)
      .map((d) => new Date(d).getTime())
      .sort();
  const totalHours = (timeFrame[timeFrame.length - 1] - timeFrame[0]) / 3600000;
  const histogramKeys = [...Array(totalHours + 1).keys()].map((index) => {
    return new Date(timeFrame[0] + 3600000 * index).toISOString();
  });
  const histogram = histogramKeys.reduce(
      (acc: {[gatedTime: string]: OCLH}, item) => {
        acc[item] = OCLHs[item];
        return acc;
      },
      {}
  );

  let interpolationArray = [];

  for (const timeKey in histogram) {
    if (Object.prototype.hasOwnProperty.call(histogram, timeKey)) {
      const entry = histogram[timeKey];
      if (!entry) {
        interpolationArray.push(timeKey);
      } else {
        if (interpolationArray.length > 0) {
          const prevKey = new Date(
              new Date(interpolationArray[0]).getTime() - 3600000
          ).toISOString();
          const startValue = histogram[prevKey].close;
          const endValue = entry.open;
          const stepValue = (endValue - startValue) / interpolationArray.length;
          const values = [...Array(interpolationArray.length + 1).keys()].map(
              (step) => Math.round((startValue + stepValue * step) * 100) / 100
          );
          const InflatedValues = interpolationArray.map((timeKey, index) => {
            const value = values[index];
            const nexValue = values[index + 1];
            return {
              open: value,
              close: nexValue,
              low: Math.min(value, nexValue),
              high: Math.max(value, nexValue),
              timestamp: new Date(timeKey).getTime(),
              interpolated: true,
            };
          });
          for (const index in interpolationArray) {
            if (
              Object.prototype.hasOwnProperty.call(interpolationArray, index)
            ) {
              histogram[interpolationArray[index]] = InflatedValues[index];
            }
          }
          interpolationArray = [];
        }
      }
    }
  }

  const mergedValues = Object.values({
    ...oldEntries.reduce((acc: {[gatedTime: string]: OCLH}, item) => {
      acc[new Date(item.timestamp).toISOString()] = item;
      return acc;
    }, {}),
    ...histogram,
  }).sort((a, b) => a.timestamp - b.timestamp);
  console.log(
      `${region} - ${currentItemHistoricSnapshot.id} : ${
        Object.values(histogram).length - 1
      } new entries`
  );
  await currentItemHistoricSnapshot.ref.set({
    timeData: mergedValues,
    updatedAt: new Date(mergedValues[mergedValues.length - 1].timestamp),
  });

  const latestDayArr = new Date(mergedValues[mergedValues.length - 1].timestamp)
      .toISOString()
      .split("T")[0]
      .split("-");
  latestDayArr[2] = ("" + (parseInt(latestDayArr[2]) - 7)).padStart(2, "0");
  const latestDay = latestDayArr.join("-");
  const groupByDay = mergedValues
      .filter(
          (item) =>
            new Date(item.timestamp).toISOString().split("T")[0] > latestDay
      )
      .reduce((acc: {[day: string]: number[]}, item) => {
        const day = new Date(item.timestamp).toISOString().split("T")[0];
        if (!acc[day]) {
          acc[day] = [];
        }
        acc[day].push(item.close);
        return acc;
      }, {});

  const shortHistoric: {[day: string]: number} = {};
  for (const timeKey in groupByDay) {
    if (Object.hasOwnProperty.call(groupByDay, timeKey)) {
      const values = groupByDay[timeKey];
      shortHistoric[timeKey] =
        Math.round(
            (values.reduce((acc, value) => acc + value, 0) /
              values.length) * 100
        ) / 100;
    }
  }
  console.log(
      `${region} - ${currentItemHistoricSnapshot.id} : Short values generated`
  );
  await itemDoc.ref.update({shortHistoric});
}

/**
 * Process historial data for the region
 * @param {Firestore} firestore - Firestore - The Firestore instance to use
 * @param {string} region - Region
 * @param {string} category - Category
 */
async function generateHistoricalData(
    firestore: Firestore,
    region: string,
    category: string) {
  const limit = pLimit(20);
  const regionSnapshot = await firestore.collection(region)
      .where("category", "==", category).get();
  await Promise.all(
      regionSnapshot.docs.map((itemDoc) =>
        limit(() => processHistoricalData(region, itemDoc, firestore))
      )
  );
}

/**
 * This function is scheduled to run every day at midnight,
 * and it will generate historical data for the previous day
 * @param {Firestore} fs - Firestore - this is the firestore instance that
 * we'll be using to read and write data
 * @param {string} region - Region
 * @param {string} category - Category
 * @return {CloudFunction[]} cloud function array ready to deploy
 */
export function historicalCloudFunctionsGenerator(
    fs: Firestore,
    region: string,
    category: string
): CloudFunction<unknown> {
  return runWith({timeoutSeconds: 540})
      .pubsub.schedule("0 0 * * *")
      .timeZone("America/New_York")
      .onRun(async () => {
        await generateHistoricalData(fs, region, category);
        return null;
      });
}
