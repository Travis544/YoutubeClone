
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import { useEffect } from 'react';
import firebase from 'firebase/compat/app';
function AuthComponent(props: any) {
    useEffect(() => {
        const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(props.auth);

        ui.start('#firebaseui-auth-container', {
            callbacks: {

            },
            signInOptions: [ // This array contains all the ways an user can authenticate in your application. For this example, is only by email.
                {
                    provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    requireDisplayName: true,
                    disableSignUp: {
                        status: true
                    }
                }
            ],
        });
    }, []);


    return (
        <div>
            <div id="firebaseui-auth-container">
            </div>
        </div>
    )
}

export default AuthComponent