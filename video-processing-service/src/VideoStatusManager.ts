import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue, Filter, CollectionReference, Firestore } from 'firebase-admin/firestore';
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
        console.log("GETTING STATUS")
        const videoDocument = this.videoCollection.doc(videoId)
        let docSnapshot = await videoDocument.get()
        if (docSnapshot.exists) {
            const data = docSnapshot.data();

            if (data) {
                console.log("DATA DOES EXIST")
                console.log(data)
                const status = data.status
                if (status) {
                    return status
                } else {
                    return VideoProcessingStatus.Undefined
                }
            } else {
                return VideoProcessingStatus.Undefined
            }
        } else {
            console.log("DATA DOES NOT EXIST")
            return VideoProcessingStatus.Undefined
        }
    }

    async updateStatus(videoId: string, status: VideoProcessingStatus): Promise<void> {
        const videoDocument = this.videoCollection.doc(videoId)
        await videoDocument.set({
            status: status
        }, { merge: true })
    }
}


export {
    VideoStatusManager,
    VideoProcessingStatus,

}
