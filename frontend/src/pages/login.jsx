import React from "react";
import axios from "axios";
import {useRef} from "react";
import { useNavigate } from "react-router-dom";

function Login() {

    // API URLS
    const booking_url = "http://34.124.236.222:8000/api/v1/customer/login";

    // SETTING NAVIGATE
    const navigate = useNavigate();

    // SETTING REF
    const username = useRef("");
    const password = useRef("");

    // FUNCTIONS
    // 1. storeRedirect
    // 2. handleSubmit
    
    // function to store username in session storage and redirect to business page if username is business
    function storeRedirect() {
        sessionStorage.setItem('name', username.current.value)
        if (sessionStorage.getItem('name') !== 'Business') {
           navigate("/");
        }
        else {
            navigate("/business");
        }
    }

    // function to handle submit
    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            customer_id: username.current.value,
            password: password.current.value
        };
        axios.post(booking_url, data)
            .then((res) => {
                storeRedirect()
            })
            .catch((err) => {
                console.log(err);
                errormsg();
            }
        );

    // function for error message
    function errormsg() {
        const errormsg = document.querySelector(".errormsg");
        errormsg.innerHTML = "Invalid username or password";
        errormsg.style.color = "red";
        errormsg.style.fontSize = "15px";
        errormsg.style.fontWeight = "600";
        errormsg.style.marginTop = "10px";
        errormsg.style.marginBottom = "10px";
    }
    };

    // RENDER
    return (
        <div className="login">
            <img src={require('../images/login-signup.jpeg')} alt="makan logo" />
            <div className="loginbox">
                <p>Login</p>
                <form className="search-form">
                    <input className="form-control" ref={username} type="text" placeholder="Username"/>
                    <input className="form-control" ref={password} type="Password" placeholder="Password"/>
                    <button type="submit" className="search-button" onClick={handleSubmit}>Lets Go!</button>
                    <div className="errormsg"></div>
                </form>
            </div>
        </div>
    );
}

export default Login;