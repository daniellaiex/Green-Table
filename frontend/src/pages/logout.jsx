import React, { useEffect } from "react";
import {useNavigate} from "react-router-dom";

function Logout() {
    sessionStorage.clear();
    const navigate = useNavigate();
    // navigate("/home");
    useEffect(() => {
        navigate("/");
    }, [navigate]);
    return (
        <div className="logout">
            <h1>Successfully signed out</h1>
        </div>
    );
}

export default Logout;