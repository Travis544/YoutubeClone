import { useContext } from "react";
import { ServiceContext } from "../Service/Firebase";
import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute(props: any) {
    const { service } = useContext(ServiceContext)
    console.log(service)
    if (service.isLoggedIn()) {
        return <Outlet />
    } else {
        return <Navigate to="/" />
    }
}

export default PrivateRoute