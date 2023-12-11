
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import { useContext, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { ServiceContext } from '../Service/Firebase';
import { Button, Page, Text } from '@geist-ui/core'
import { LogIn } from '@geist-ui/icons'
import { useNavigate } from "react-router-dom";

function LoginButton(props: any) {
    const { redirectURL } = props
    const navigate = useNavigate();
    const { service } = useContext(ServiceContext)
    useEffect(() => {
        // console.log("CURRENT USER" + service.getCurrentUsername())
        if (service.isLoggedIn()) {
            navigate(redirectURL)
        }
    }, [navigate, redirectURL, service])

    const logIn = async () => {
        const isSuccess = await service.googleSignIn()
        if (isSuccess) {
            navigate(redirectURL)
        } else {
            alert("Login Failed")
        }
    }


    return (
        <div>
            <div id="firebaseui-auth-container">
                <Button onClick={logIn}>
                    <LogIn />
                    {' '} Login With Google
                </Button>
            </div>
        </div>
    )
}

export default LoginButton