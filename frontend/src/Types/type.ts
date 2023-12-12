import { Timestamp } from "firebase/firestore"

export interface Video {
    videoId: string
    videoName: string
    userId: string
    description: string
    status: string,
    timestamp: Timestamp,
    contentType: string,
    resolutionToVideoURI: Map<number, string>
}