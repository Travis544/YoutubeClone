import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Filter, CollectionReference, Firestore } from 'firebase-admin/firestore';
import { Database } from 'firebase-admin/lib/database/database';
const serviceAccount = require("../firebaseKey.json")

enum VideoProcessingStatus {
    //an error occurred while processing the video
    Undefined = "Undefined",
    //the video is currently being processed
    Processing = "Processing",
    Processed = "Processed"
}


class VideoStatusManager {
    db: Firestore
    videoCollection: CollectionReference

    constructor() {
        initializeApp({
            credential: cert(serviceAccount)
        });
        this.db = getFirestore();
        this.videoCollection = this.db.collection('Video')
    }

    async saveTranscodedVideoMapping(videoId: string, resolutionToVideoId: Map<number, string>) {
        const videoDocument = this.videoCollection.doc(videoId)
        await videoDocument.update({
            resolutionToVideoId: Object.fromEntries(resolutionToVideoId.entries())
        })
    }

    async getStatus(videoId: string): Promise<VideoProcessingStatus> {
        const videoDocument = this.videoCollection.doc(videoId)
        let docSnapshot = await videoDocument.get()
        if (docSnapshot.exists) {
            const data = docSnapshot.data();

            if (data) {
                const status = data.status
                return status
            } else {
                return VideoProcessingStatus.Undefined
            }
        } else {
            return VideoProcessingStatus.Undefined
        }
    }

    async updateStatus(videoId: string, status: VideoProcessingStatus): Promise<void> {
        const videoDocument = this.videoCollection.doc(videoId)
        await videoDocument.update({
            status: status
        })
    }
}


export {
    VideoStatusManager,
    VideoProcessingStatus,

}
