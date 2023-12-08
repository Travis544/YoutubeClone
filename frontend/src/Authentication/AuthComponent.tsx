
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import { useEffect } from 'react';
import firebase from 'firebase/compat/app';

function AuthComponent(props: any) {
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(props.auth);
    useEffect(() => {
        ui.start('#firebaseui-auth-container', {
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    // User successfully signed in.
                    // Return type determines whether we continue the redirect automatically
                    // or whether we leave that to developer to handle.
                    console.log(authResult)
                    console.log(redirectUrl)
                    return false
                },
            },
            signInSuccessUrl: "http://localhost:3000/",
            signInFlow: 'popup',
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
    }, [props.auth]);




    return (
        <div>
            <div id="firebaseui-auth-container">

            </div>
        </div>
    )
}

export default AuthComponent