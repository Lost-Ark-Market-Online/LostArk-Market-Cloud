import {firestore} from "firebase-functions";
import * as Handlebars from "handlebars";

import type {QueryDocumentSnapshot} from "firebase-functions/v1/firestore";
import type {Firestore} from "firebase-admin/firestore";
import type {CloudFunction} from "firebase-functions";

import {template} from "./templates/application.json";

const applicationTemplate = Handlebars.compile(template);

/**
 * When a new application is created, send an email to the applicant
 * @param {Firestore} fs - Firestore - This is the Firestore instance
 * that we'll use to write to the mail collection.
 * @return {CloudFunction} A CloudFunction.
 */
export function triggerSendApplicantEmailFactory(
    fs: Firestore
): CloudFunction<QueryDocumentSnapshot> {
  return firestore.document("applications/{applicationId}").onCreate((doc) => {
    const application = doc.data();
    fs.collection("mail").add({
      to: application.email,
      message: {
        subject: "LostArk Market Watcher application",
        text: applicationTemplate({
          region: application.region,
        }),
      },
    });
  });
}
