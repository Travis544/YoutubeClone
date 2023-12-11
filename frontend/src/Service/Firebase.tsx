import { FirebaseApp, initializeApp } from "firebase/app";

import {
    CollectionReference,
    collection,
    doc,
    setDoc,
    Firestore,
    Timestamp,
    getFirestore,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { Auth, getAuth, signInWithPopup, GoogleAuthProvider, browserSessionPersistence, User } from "firebase/auth";

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
        this.videoCollection = collection(this.db, 'Video')
    }

    getAuth() {
        return this.auth
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

}

export function ServiceProvider(props: any) {
    const [currentUser, setCurrentUser] = useState<User | null>()
    const [loading, setLoading] = useState(true)
    const firebaseService = new FirebaseService()
    useEffect(() => {
        const unsubscribe = firebaseService.getAuth().onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })
        return unsubscribe
    }, [])

    function getUser() {
        return firebaseService.getAuth().currentUser
    }

    const value = {
        currentUser: currentUser,
        service: firebaseService,
        getUser: getUser
    }

    return (
        <ServiceContext.Provider value={value}>
            {!loading && props.children}
        </ServiceContext.Provider>
    )
}