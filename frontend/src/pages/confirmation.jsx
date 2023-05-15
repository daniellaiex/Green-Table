import React from "react";
import axios from "axios";
import {useParams, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";

function Confirmation() {

    // GET INFO FROM URL
    const {booking_id} = useParams();

    // API URLS
    const booking_url = "http://34.124.236.222:8000/api/v1/booking/getBooking";
    const customer_url = "http://34.124.236.222:8000/api/v1/customer";
    const place_url = "http://34.124.236.222:8000/api/v1/catalog/find";
    const cancel_url = "http://34.124.236.222:8000/api/v1/cancel";

    // SETTING NAVIGATE
    const navigate = useNavigate();

    // SETTING STATES
    const [data, setData] = useState([]);

    const [cus, setCus] = useState([]);

    const [info, setInfo] = useState([]);

    useEffect(() => {
        const all = async () => {
            if (booking_id !== undefined) {
                await axios.get(booking_url + '/' + booking_id)
                .then(
                response => setData(response.data.data))
            }
        }
        all();
    }, [booking_id]);

    useEffect(() => {
        const all = async () => {
            if (data.length !== 0) {
                await axios.get(customer_url + '/' + data.customer)
                .then(
                response => setCus(response.data.data))
             }
        }
        all();
    }, [data.customer, data.length]);

    useEffect(() => {
        const all = async () => {
            if (data.length !== 0) {
                await axios.get(place_url + '/' + data.restaurant)
                .then(
                response => setInfo(response.data.data))
            }
        }
        all();
    }, [data.restaurant, data.length]);

    // FUNCTIONS
    // 1. cancelBooking
    // 2. formatDate
    // 3. splitPhone

    // cancel booking
    function cancelBooking(){
        axios.post(cancel_url + '/' + booking_id, {restaurant_name: data.restaurant, time: data.time, date: data.date})
        .then(
            response => {
                console.log(response.data.data);
                navigate(`/cancel`)
            }
        )
    }

    // format date
    function formatDate (date) {
        const day = date.slice(0,2);   
        const month = date.slice(2,4);
        const year = date.slice(4,6);
        return day + '/' + month + '/' + year;
    }

    // format phone number
    function splitPhone(phone){
        return phone.slice(0,4) + ' ' + phone.slice(4,8);
    }
    
    // RENDER
    if (data.length !== 0 && cus.length !== 0 && info.length !== 0) {
        return (
            <div className="confirmation">
                <img src={require('../images/confirm.png')} alt="..."/>
                <h4>Booking Confirmed</h4>
                <p>Check your details below</p>

                <div className="container-fluid">
                <div className="tt row">

                    <div className="col-6">
                        <div className="card carded">
                        <div className="card-body">
                            <h3 className="card-title">Booking Details</h3>
                            <hr/>
                            <p className="card-text"><b>Restaurant:</b><br/>{data.restaurant}</p>
                            <p className="card-text"><b>Location:</b><br/>{info.location.formatted_address}<br/>Singapore {info.location.postal_code}</p>
                            <p className="card-text"><b>Time:</b><br/>{data.time}</p>
                            <p className="card-text"><b>No. of pax:</b><br/>{data.no_of_pax}</p>
                            <p className="card-text"><b>Date:</b><br/>{formatDate(data.date)}</p>
                        </div>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="card cardbd">
                        <div className="card-body">
                        <h3 className="card-title">Personal Details</h3>
                            <hr/>
                            <p className="card-text"><b>Booker Name:</b><br/>{data.customer}</p>
                            <p className="card-text"><b>Email:</b><br/>{cus.email}</p>
                            <p className="card-text"><b>Mobile:</b><br/>+65 {splitPhone(cus.phone)}</p>
                        </div>
                        </div>
                    </div>

                    </div>
                </div>

                <button type="submit" className="cancelbooking" onClick={cancelBooking}>Cancel booking</button>
            </div>
        );
    }
}

export default Confirmation;