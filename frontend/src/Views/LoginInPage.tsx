import { ServiceContext } from '../Service/Firebase';
import { useContext, useEffect } from 'react';
import LoginButton from '../Components/LoginButton';
import { useNavigate } from "react-router-dom";

function LoginInPage(props: any) {
    const navigate = useNavigate()
    const { service } = useContext(ServiceContext)

    useEffect(() => {
        if (service.isLoggedIn()) {
            navigate("/home")
        }
    })

    return (
        <div>
            <LoginButton />
        </div>
    )
}

export default LoginInPage