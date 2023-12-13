import { FirebaseApp, initializeApp } from "firebase/app";

import {
    CollectionReference,
    collection,
    doc,
    setDoc,
    Firestore,
    Timestamp,
    getFirestore,
    onSnapshot,
    query,
    where,
    DocumentData
} from "firebase/firestore";


import { VIDEO_COLLECTION_NAME } from "../constants";
import { Video } from "../Types/types"
import { createContext, useEffect, useState } from "react";
import { Auth, getAuth, signInWithPopup, GoogleAuthProvider, browserSessionPersistence, User, Unsubscribe } from "firebase/auth";

/**contains API key, project id information for this particular web app. This configuration can be downloaded
in "Your apps" in the project settings in Firebase
**/
import firebaseConfig from "./key.json"
export const ServiceContext = createContext(null as any | null)



export class FirebaseService {
    app: FirebaseApp
    auth: Auth
    db: Firestore
    videoCollection: CollectionReference

    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.auth.setPersistence(browserSessionPersistence)
        this.db = getFirestore(this.app);
        this.videoCollection = collection(this.db, VIDEO_COLLECTION_NAME)
    }

    getAuth() {
        return this.auth
    }

    getDB() {
        return this.db
    }

    async googleSignIn() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider)
            if (result) {
                return true
            } else {
                return false
            }
        } catch (err) {
            return false
        }
    }

    isLoggedIn() {
        return !!this.auth.currentUser
    }

    getCurrentUserId() {
        return this.auth.currentUser?.uid
    }

    logOut() {
        this.auth.signOut()
    }

}

export function ServiceProvider(props: any) {
    const [currentUser, setCurrentUser] = useState<User | null>()
    const [loading, setLoading] = useState(true)
    const [videos, setVideos] = useState<Array<Video>>([])
    const [myVideos, setMyVideos] = useState<Array<Video>>([])

    const firebaseService = new FirebaseService()

    function parseVideoDocumentToVideo(doc: DocumentData): Video {
        let data = doc.data()
        let resolutionToVideoURI: Map<string, string> | null = null
        if (data.resolutionToVideoId) {
            resolutionToVideoURI = new Map(Object.entries(data.resolutionToVideoId))
        }

        let video: Video = {
            videoId: doc.id,
            videoName: data.videoName,
            userId: data.userId,
            description: data.description,
            status: data.status,
            timestamp: data.timestamp,
            contentType: data.contentType,
            resolutionToVideoURI: resolutionToVideoURI
        }

        return video
    }

    useEffect(() => {
        let myVideoSnapshotUnsubscribe: Unsubscribe | null = null
        const authUnsubscribe = firebaseService.getAuth().onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
            if (!user) {
                if (myVideoSnapshotUnsubscribe) {
                    myVideoSnapshotUnsubscribe()

                }

            } else {
                const videoQuery = query(collection(firebaseService.getDB(), VIDEO_COLLECTION_NAME), where("userId", "==", user?.uid));
                myVideoSnapshotUnsubscribe = onSnapshot(videoQuery,
                    (querySnapshot) => {
                        let myVideos = []
                        const documents = querySnapshot.docs
                        for (const doc of documents) {
                            const video = parseVideoDocumentToVideo(doc)
                            myVideos.push(video)
                        }
                        console.log("USER IS LOGGED IN, my videos:")
                        console.log(myVideos)
                        setMyVideos(myVideos)
                    })
            }

        })

        const snapshotUnsubscribe = onSnapshot(collection(firebaseService.getDB(), VIDEO_COLLECTION_NAME), (querySnapshot) => {
            const documents = querySnapshot.docs
            const videos: Array<Video> = []
            console.log("Received update from video collection listener")
            for (const doc of documents) {
                const video = parseVideoDocumentToVideo(doc)
                if (video.status === "Processed") {
                    videos.push(video)
                }
            }
            setVideos(videos)
        });

        return () => {
            console.log("Unsubscribe from listeners")
            authUnsubscribe()
            snapshotUnsubscribe()
            if (myVideoSnapshotUnsubscribe != null) {
                myVideoSnapshotUnsubscribe()
            }
        };
    }, [])

    function getUser() {
        return firebaseService.getAuth().currentUser
    }

    const value = {
        currentUser: currentUser,
        service: firebaseService,
        videos: videos,
        myVideos: myVideos,
        getUser: getUser
    }

    return (
        <ServiceContext.Provider value={value}>
            {!loading && props.children}
        </ServiceContext.Provider>
    )
}