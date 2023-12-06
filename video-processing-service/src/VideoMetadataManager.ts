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


type VideoMetadata = {
    userId: string
    videoName: string,
    status: VideoProcessingStatus
};


class VideoMetadataManager {
    db: Firestore
    videoCollection: CollectionReference

    constructor() {
        initializeApp({
            credential: cert(serviceAccount)
        });
        this.db = getFirestore();
        this.videoCollection = this.db.collection('Video')
    }

    async saveVideoMetadata(videoId: string, videoMetadata: VideoMetadata) {
        const videoDocument = this.videoCollection.doc(videoId)
        await videoDocument.set(videoMetadata);
    }

    async getStatus(videoId: string): Promise<VideoProcessingStatus> {
        const videoDocument = this.videoCollection.doc(videoId)
        let docSnapshot = await videoDocument.get()
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            console.log(data)
            if (data) {
                const status = data.status
                return status
            } else {
                throw new Error("Video not found")
            }
        } else {
            throw new Error("Video not found")
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
    VideoMetadataManager,
    VideoProcessingStatus,
    VideoMetadata
}