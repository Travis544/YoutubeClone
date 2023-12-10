import { FirebaseApp, initializeApp } from "firebase/app";

import {
    Firestore,
    getFirestore,
} from "firebase/firestore";
import { createContext } from "react";
import { Auth, getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

/**contains API key, project id information for this particular web app. This configuration can be downloaded
in "Your apps" in the project settings in Firebase
**/
import firebaseConfig from "./key.json"
export const ServiceContext = createContext({} as FirebaseService)

export class FirebaseService {
    app: FirebaseApp
    auth: Auth
    db: Firestore
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
    }


    async googleSignIn() {
        const provider = new GoogleAuthProvider();
        signInWithPopup(this.auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential: any = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)
                // ...
                return true
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
                throw new Error(errorMessage)
            });
    }


    isLoggedIn() {
        return !!this.auth.currentUser
    }

    getCurrentUsername() {
        return
    }
}

