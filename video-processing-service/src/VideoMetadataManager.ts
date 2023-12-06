import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Filter, CollectionReference, Firestore } from 'firebase-admin/firestore';
import { Database } from 'firebase-admin/lib/database/database';
const serviceAccount = require("../firebaseKey.json")

enum VideoProcessingStatus {
    //an error occurred while processing the video
    Undefined,
    //the video is currently being processed
    Processing,
    Processed
}

class VideoMetadataManager {
    db: Firestore
    videoCollection: CollectionReference

    constructor() {
        console.log(serviceAccount)
        initializeApp({
            credential: cert(serviceAccount)
        });
        this.db = getFirestore();
        this.videoCollection = this.db.collection('Video')
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

    async setStatus(videoId: string, status: VideoProcessingStatus): Promise<void> {
        const videoDocument = this.videoCollection.doc(videoId)
        await videoDocument.update({
            status: status
        })
    }
}


export {
    VideoMetadataManager,
    VideoProcessingStatus
}
