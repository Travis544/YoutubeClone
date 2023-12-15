import { Timestamp } from "firebase/firestore"

export interface Video {
    videoId: string
    videoName: string
    userId: string
    description: string
    status: string,
    timestamp: Timestamp,
    contentType: string,
    resolutionToVideoURI: Map<string, string> | null
}


export interface UserData {
    userId: string
    name: string
    photoUrl: string
}

export enum VideoStatus {
    //video is uploading
    Uploading = "Uploading",
    //an error occurred while processing the video
    Undefined = "Undefined",
    //the video is currently being processed
    Processing = "Processing",
    Processed = "Processed"
}
