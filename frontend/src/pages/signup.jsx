import React from "react";
import axios from "axios";
import {useRef} from "react";
import { useNavigate } from "react-router-dom";

function Signup() {

    // API URLS
    const booking_url = "http://34.124.236.222:8000/api/v1/customer/add";

    // SETTING NAVIGATE
    const navigate = useNavigate();

    // SETTING REF
    const firstname = useRef("");
    const lastname = useRef("");
    const username = useRef("");
    const password = useRef("");
    const email = useRef("");
    const phone = useRef("");
    const telegram = useRef("");
    const cardno = useRef("");
    const expiry = useRef("");
    const cvv = useRef("");

    // FUNCTIONS
    // 1. handleSubmit
    // 2. errormsg

    // function to handle submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (errormsg() === false) {
            errormsg();
        }
        else{
            const data = {
                _id: username.current.value,
                password: password.current.value,
                phone: phone.current.value,
                telegram : telegram.current.value,
                email: email.current.value,
                first_name: firstname.current.value,
                last_name: lastname.current.value,
                credit_card: {
                    card_number: cardno.current.value ,
                    expiration_date: expiry.current.value,
                    security_code: cvv.current.value
                }
            };
            axios.post(booking_url, data)
                .then((res) => {
                    console.log(res);
                    navigate("/login");
                })
                .catch((err) => {
                    console.log(err);
                    const errormsg = document.querySelector(".errormsg");
                    errormsg.innerHTML = "Username already exists";
                    errormsg.style.color = "red";
                    errormsg.style.fontSize = "15px";
                    errormsg.style.fontWeight = "600";
                    errormsg.style.marginTop = "10px";
                }
            );
        }

    };

    // function for error message
    function errormsg() {
        const errormsg = document.querySelector(".errormsg");
        var allmsg = '';
        if (firstname.current.value === "" || lastname.current.value === "" || username.current.value === "" || password.current.value === "" || email.current.value === "" || phone.current.value === "" || telegram.current.value === "" || cardno.current.value === "" || expiry.current.value === "" || cvv.current.value === ""){
            allmsg += "Please fill in all the fields<br/>";
        }
        // check if email inputs include @
        if (email.current.value.includes("@") === false){
            allmsg += " Please enter a valid email<br/>";
        }
        // check if telegram inputs include @
        if (telegram.current.value.includes("@") === false){
            allmsg += " Please enter a valid telegram username<br/>";
        }
        // check if phone number is 8 digits
        if (phone.current.value.length !== 8){
            allmsg += " Please enter a valid phone number<br/>";
        }
        // check if cvv is 3 digits
        if (cvv.current.value.length < 3 || cvv.current.value.length > 4){
            allmsg += " Please enter a valid cvv<br/>";
        }
        // check expiry date make sure 'mm/yy' format
        if (isNaN(expiry.current.value[0]) || isNaN(expiry.current.value[1]) || expiry.current.value[2] !== "/" || isNaN(expiry.current.value[3]) || isNaN(expiry.current.value[4])){
            allmsg += " Please enter a valid expiry date<br/>";
        }

        console.log(isNaN(expiry.current.value[0]));

        errormsg.innerHTML = allmsg;
        errormsg.style.color = "red";
        errormsg.style.fontSize = "15px";
        errormsg.style.fontWeight = "600";
        errormsg.style.marginTop = "10px";
        if (allmsg === ''){
            return true
        }
        else{
            return false
        }
    }

    // RENDER
    return (
        <div className="signup">
            <img src={require('../images/login-signup.jpeg')} alt="makan logo" />
            <div className="signupbox">
                <p>Signup</p>
                <form className="search-form">
                    <div className="row">
                        <div className="col-6">
                            <div className="row">
                                <div className="col-6">
                                    <input className="form-control" type="text" placeholder="First Name" ref={firstname}/>
                                </div>
                                <div className="col-6">
                                    <input className="form-control" type="text" placeholder="Last Name" ref={lastname}/>
                                </div>
                            </div>
                            <input className="form-control" type="text" placeholder="Username"ref={username}/>
                            <input className="form-control" type="Password" placeholder="Password" ref={password}/>
                            <input className="form-control" type="email" placeholder="Email" ref={email}/>
                            <input className="form-control" type="numbers" placeholder="Phone" ref={phone}/>
                            <input className="form-control" type="text" placeholder="@Telegram_handle" ref={telegram}/>
                        </div>
                        <div className="col-6">
                            <input className="form-control" type="tel" placeholder="Credit Card No." minLength={16} ref={cardno}/>
                            <div className="row">
                                <div className="col-6">
                                    <input className="form-control" type="tel" placeholder="Expiry Date eg. 01/23" ref={expiry}/>
                                </div>
                                <div className="col-6">
                                    <input className="form-control" type="tel" placeholder="CVV" ref={cvv}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="search-button" onClick={handleSubmit}>Lets Go!</button>
                    <div className="errormsg"></div>
                </form>
            </div>
        </div>
    );
}

export default Signup;