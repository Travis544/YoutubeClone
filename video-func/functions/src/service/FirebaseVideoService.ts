import { VideoMetadata, VideoService } from './VideoService';

import { GetSignedUrlConfig } from '@google-cloud/storage';
import { Storage } from '@google-cloud/storage';
import { initializeApp } from "firebase-admin/app";
import { CollectionReference, Firestore, getFirestore } from "firebase-admin/firestore";

const UPLOADED_VIDEO_BUCKET_NAME = 'uploaded-video-bucket';
const TRANSCODED_VIDEO_BUCKET_NAME = "transcoded-videos-bucket"
initializeApp();
export class FirebaseVideoService implements VideoService {
    private storage: Storage
    private firestore: Firestore
    private videoCollection: CollectionReference


    constructor() {
        // Creates a client, loading the service account key.
        this.storage = new Storage({ keyFilename: 'key.json' });
        this.firestore = getFirestore()
        this.videoCollection = this.firestore.collection("Video")
    }

    async generateSignedUrlForUpload(videoFileName: string, contentType: string): Promise<string> {
        const options: GetSignedUrlConfig = {
            version: 'v4',
            action: "write",
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: contentType,
        };

        // Get a v4 signed URL for uploading file
        const url = await this.storage
            .bucket(UPLOADED_VIDEO_BUCKET_NAME)
            .file(videoFileName)
            .getSignedUrl(options);


        return url.toString()
    }

    async saveVideoMetadata(videoFileName: string, videoMetadata: VideoMetadata): Promise<void> {
        await this.videoCollection.doc(videoFileName).set(videoMetadata, { merge: true })
    }


    async deleteVideoMetadata(videoId: string): Promise<void> {
        let docReference = this.videoCollection.doc(videoId)
        let doc = await docReference.get()
        if (!doc.exists) {
            return
        }
        await docReference.delete()
    }

    async deleteVideoFile(videoFileName: string): Promise<void> {
        let transcodedVideoBucket = this.storage.bucket(TRANSCODED_VIDEO_BUCKET_NAME)
        let file = transcodedVideoBucket.file(videoFileName)
        if (await file.exists()) {
            await file.delete()
        }
    }

    async getVideoMetatadata(videoId: string) {
        let docReference = this.videoCollection.doc(videoId)
        let doc = await docReference.get()
        if (!doc.exists) {
            return
        }
        let data = doc.data()!
        return data
    }

}