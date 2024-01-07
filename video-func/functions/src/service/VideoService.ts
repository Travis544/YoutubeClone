import { Timestamp } from "firebase-admin/firestore";

export type VideoMetadata = {
    userId: string
    videoName: string,
    description: string,
    timestamp: Timestamp,
    contentType: string,
    status: string
};

export interface VideoService {
    /**
     * Delete video metadata in the db.
     * @param videoId videoId of the video to delete
     * @returns void
     */
    deleteVideoMetadata(videoId: string): Promise<void>;

    /**
    * Deletes the stored video file
    * @param videoFileName videoId of the video file to delete
    * @returns void
    */
    deleteVideoFile(videoFileName: string): Promise<void>;

    /**
     * Retrieve video metadata from db
     * @param videoId videoId of the video to retrieve metadata for
     * @returns video metadata as an object
     */
    getVideoMetatadata(videoId: string): Promise<any>

    /**
     * Save video metadata to storage.
     * @param videoFileName video file name
     * @param videoMetadata object containing video metadata
     */
    saveVideoMetadata(videoFileName: string, videoMetadata: VideoMetadata): Promise<void>

    /**
     * Create a signed url for uploading video file to storage bucket
     * @param videoFileName video file name to create signed url for
     * @param contentType content type of video file
     * @returns signed url as a string
     */
    generateSignedUrlForUpload(videoFileName: string, contentType: string): Promise<string>

}

