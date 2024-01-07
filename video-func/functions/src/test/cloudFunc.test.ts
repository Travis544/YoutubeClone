import * as sinon from 'sinon';
import * as mocha from "mocha"
import * as ServiceImpl from '../service/FirebaseVideoService';
import { VideoMetadata } from '../service/VideoService';
import { Timestamp } from 'firebase-admin/firestore';

const videoServiceStub = sinon.createStubInstance(ServiceImpl.FirebaseVideoService)

sinon.stub(ServiceImpl, "FirebaseVideoService").callsFake((args) => {
    return videoServiceStub
})

const cloudFunctions = require('../index');
describe("Delete video function", function () {

    beforeEach(() => {
        const fakeResolutionToVideoId = new Map()
        fakeResolutionToVideoId.set("360", "www.test.com")
        const fakeVideoData = {
            userId: "user",
            videoName: "Cool video",
            description: "This is a cool video",
            timestamp: Timestamp.now(),
            contentType: "application/mp3",
            status: "Processed",
            resolutionToVideoId: fakeResolutionToVideoId
        }

        videoServiceStub.getVideoMetatadata.withArgs("ABC").returns(Promise.resolve(fakeVideoData))
    });

    afterEach(() => {
        sinon.resetHistory()
    });


    it("deletes video metadata and video file", async function () {
        const VIDEO_ID = "ABC"
        await cloudFunctions.deleteVideo(VIDEO_ID)
        assert(videoServiceStub.deleteVideoMetadata.called)
        assert(videoServiceStub.deleteVideoFile.calledOnce)
        assert(videoServiceStub.deleteVideoFile.calledWith("360_" + VIDEO_ID), "called with wrong arg")
    });

})

function assert(condition: boolean, message = "Assertion failed") {
    if (!condition) {
        throw new Error(message);
    }
}