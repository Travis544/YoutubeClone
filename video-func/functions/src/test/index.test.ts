
// const test = require('firebase-functions-test')();

// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.

// Sinon is a library used for mocking or verifying function calls in JavaScript.
import * as sinon from 'sinon';
// Require firebase-admin so we can stub out some of its methods.
import * as admin from 'firebase-admin';
import * as test from 'firebase-functions-test';
import * as mocha from "mocha"
import * as firebase from "firebase-admin/firestore";

const testObj = test()
const adminInitStub = sinon.stub(admin, 'initializeApp');
const firestoreStub = sinon.createStubInstance(firebase.Firestore)
const videoCollectionStub = sinon.createStubInstance(firebase.CollectionReference)

sinon.stub(firebase, "getFirestore").returns(firestoreStub)
firestoreStub.collection.withArgs("Video").returns(videoCollectionStub)

const cloudFunctions = require('../index');
describe("Delete video function", function () {
    before(() => {
        // [START stubAdminInit]
        console.log('initializeing test...')
    });

    after(() => {
        // Restore admin.initializeApp() to its original method.
        adminInitStub.restore();
        // Do other cleanup tasks.
        testObj.cleanup();
    });


    it("deletes video metadata from firestore", async function () {
        const VIDEO_ID = "ABC"
        const docRefStub = sinon.createStubInstance(firebase.DocumentReference)
        videoCollectionStub.doc.withArgs(VIDEO_ID).returns(
            docRefStub
        )
        await cloudFunctions.deleteVideo(VIDEO_ID)
        assert(docRefStub.delete.called)
    });
})



function assert(condition: boolean, message = "Assertion failed") {
    if (!condition) {
        throw new Error(message);
    }
}
