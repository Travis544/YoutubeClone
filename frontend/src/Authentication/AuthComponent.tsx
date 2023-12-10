
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import { useContext, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { ServiceContext } from '../Service/Firebase';

function AuthComponent(props: any) {
    const service = useContext(ServiceContext)

    return (
        <div>
            <div id="firebaseui-auth-container">

            </div>
        </div>
    )
}

export default AuthComponent