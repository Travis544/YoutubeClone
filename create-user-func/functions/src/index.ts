/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";

// The Firebase Admin SDK to access Firestore.
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import functions = require("firebase-functions");
import { UserRecord } from "firebase-functions/v1/auth";

initializeApp();
const firestore = getFirestore()
console.log('I am a log entry!');
logger.info("TEST LOG")
async function writeUserDocument(user: UserRecord) {
    let userDoc = firestore.collection("User").doc(user.uid)
    return await userDoc.set({
        email: user.email,
        photoUrl: user.photoURL,
        name: user.displayName
    }, { merge: true })
}

exports.createUserDocument = functions.auth.user().onCreate((user: UserRecord) => {
    return writeUserDocument(user).then(() => {
        logger.info(`User document successfully created...${user}`)
    }).catch(() => {
        logger.info(`User document creation failed...${user}`)
    })
});

