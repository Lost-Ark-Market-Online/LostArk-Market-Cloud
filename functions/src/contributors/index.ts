import {firestore} from "firebase-functions";

import type {QueryDocumentSnapshot} from "firebase-functions/v1/firestore";
import {FieldValue, Firestore} from "firebase-admin/firestore";
import type {CloudFunction} from "firebase-functions";


/**
 * "When a new entry is created, update the entry with
 * the author's ID and increment the author's
 * contribution count."
 * @param {Firestore} fs - Firestore
 * @return {CloudFunction<QueryDocumentSnapshot>}
 */
export function triggerMarketItemEntryFactory(
    fs: Firestore
): CloudFunction<QueryDocumentSnapshot> {
  return firestore
      .document("{region}/{itemId}/entries/{entryId}")
      .onCreate((doc) => {
        const {author} = doc.data();
        if (author) {
          fs.doc(`collaborators/${author}`).update({
            contributions: FieldValue.increment(1),
          });
        }
      });
}
