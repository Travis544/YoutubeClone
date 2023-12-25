import { FirebaseApp, initializeApp } from "firebase/app";

import {
    CollectionReference,
    collection,
    doc,
    setDoc,
    getDoc,
    Firestore,
    Timestamp,
    getFirestore,
    onSnapshot,
    query,
    where,
    DocumentData,
    QuerySnapshot
} from "firebase/firestore";


import { USER_COLLECTION_NAME, VIDEO_COLLECTION_NAME } from "../constants";
import { Video, UserData } from "../Types/types"
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

    async getUser(userId: string): Promise<UserData> {
        const docRef = doc(this.db, USER_COLLECTION_NAME, userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            let data = docSnap.data()

            return {
                userId: docSnap.id,
                name: data.name,
                photoUrl: data.photoUrl
            }
        } else {
            throw new Error("User does not exist")
        }

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
    const [videos, setVideos] = useState<Map<string, Video>>(new Map())
    const [myVideos, setMyVideos] = useState<Map<string, Video>>(new Map())

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
            thumbnailURI: data.thumbnailURI ? data.thumbnailURI : null,
            contentType: data.contentType,
            resolutionToVideoURI: resolutionToVideoURI
        }

        return video
    }

    function handleVideoChange(querySnapshot: QuerySnapshot, videoIdToVideoMapState: Map<string, Video>,
        setVideos: (videos: Map<string, Video>) => void,) {
        // const videoIdToVideos: Map<string, Video> = new Map<string, Video>();
        querySnapshot.docChanges().forEach((change) => {
            let video: Video = parseVideoDocumentToVideo(change.doc)

            if (change.type === "added") {
                // videoIdToVideos.set(video.videoId, video)
                setVideos(new Map(videoIdToVideoMapState.set(video.videoId, video)))
            }
            if (change.type === "modified") {
                setVideos(new Map(videoIdToVideoMapState.set(video.videoId, video)));
            }

            //TODO implement this
            if (change.type === "removed") {
                //setMyVideos(new Map(videos.set(video.videoId, video)));
            }


        })
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
                const myVideoQuery = query(collection(firebaseService.getDB(), VIDEO_COLLECTION_NAME), where("userId", "==", user?.uid));
                myVideoSnapshotUnsubscribe = onSnapshot(myVideoQuery, (querySnapshot) => {
                    handleVideoChange(querySnapshot, myVideos, (videoIdToVideos) => { setMyVideos(videoIdToVideos) })
                });
            }

        })

        const videoQuery = query(collection(firebaseService.getDB(), VIDEO_COLLECTION_NAME), where("status", "==", "Processed"))
        const snapshotUnsubscribe = onSnapshot(videoQuery, (querySnapshot) => {
            handleVideoChange(querySnapshot, videos, (videoIdToVideos) => { setVideos(videoIdToVideos) })
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

    function getCurrentUser() {
        return firebaseService.getAuth().currentUser
    }


    async function getUser(userId: string) {
        return await firebaseService.getUser(userId)
    }


    const value = {
        currentUser: currentUser,
        service: firebaseService,
        videos: videos,
        myVideos: myVideos,
        getCurrentUser: getCurrentUser,
        getUser: getUser
    }

    return (
        <ServiceContext.Provider value={value}>
            {!loading && props.children}
        </ServiceContext.Provider>
    )
}