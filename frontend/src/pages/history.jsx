import React from "react";
import axios from "axios";
import { useState , useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";

function History() {

    // API URLS
    const booking_url = "http://34.124.236.222:8000/api/v1/booking/getBookings/";

    // SETTING NAVIGATE
    const navigate = useNavigate();

    // GETTING USERNAME
    var username = sessionStorage.getItem('name');

    // SETTING DATA
    const [data, setData] = useState([]);

    useEffect(() => {
        const all = async () => {
            await axios.get(booking_url + username)
            .then((response) => {
                console.log(response.data.data);
                setData(response.data.data);
            }
            )
            .catch((error) => {
                console.log(error);
                setData([])
            });        
        }
        all();
    }, [username, booking_url]);

    // FUNCTIONS
    // 1. getAll
    // 2. getPaid
    // 3. getPending
    // 4. formatStatus
    // 5. formatStatusPayment
    // 6. formatDate

    // getting all bookings
    function getAll() {
        return (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Booking ID</th>
                        <th scope="col">Restaurant</th>
                        <th scope="col">Date</th>
                        <th scope="col">Time</th>
                        <th scope="col">Number of people</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((booking, index) => (
                        <tr key={index}>
                            <th scope="row">{booking._id}</th>
                            <td>{booking.restaurant}</td>
                            <td>{formatDate(booking.date)}</td>
                            <td>{booking.time}</td>
                            <td>{booking.no_of_pax}</td>
                            <td>{formatStatus(booking.paid_status)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        );
    }

    // getting paid bookings
    function getPaid(){
        var newArray = data.filter(function (el) {
            return el.paid_status === true;
        });
        if (newArray.length === 0) {
            return <h3 className="tableerr">No paid bookings</h3>;
        } 
        else {

            return (
                <div className="table-responsive">
                <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Booking ID</th>
                        <th scope="col">Restaurant</th>
                        <th scope="col">Date</th>
                        <th scope="col">Time</th>
                        <th scope="col">Number of people</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {newArray.map((each, index) => (
                        <tr key={index}>
                            <th scope="row">{each._id}</th>
                            <td>{each.restaurant}</td>
                            <td>{formatDate(each.date)}</td>
                            <td>{each.time}</td>
                            <td>{each.no_of_pax}</td>
                            <td>{formatStatus(each.paid_status)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            );
        }
    }

    // getting pending bookings
    function getPending(){
        var newArray = data.filter(function (el) {
            return el.paid_status === false;
        });
        if (newArray.length === 0) {
            return <h3 className="tableerr">No paid bookings</h3>;
        } 
        else {

            return (
                <div className="table-responsive">
                <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Booking ID</th>
                        <th scope="col">Restaurant</th>
                        <th scope="col">Date</th>
                        <th scope="col">Time</th>
                        <th scope="col">Number of people</th>
                        <th scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {newArray.map((each, index) => (
                        <tr key={index}>
                            <th scope="row"><Link to={"/confirmation/" + each._id}>{each._id}</Link></th>
                            <td>{each.restaurant}</td>
                            <td>{formatDate(each.date)}</td>
                            <td>{each.time}</td>
                            <td>{each.no_of_pax}</td>
                            <td>{formatStatusPayment(each.items_ordered, each._id, each.customer)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            );
        }
    }

    // formatting of status
    function formatStatus(status) {
        if (status === false) {
            return "Waiting for payment";
        } else {
            return "Paid";
        }
    }

    // formatting of pending
    function formatStatusPayment(status, booking_id, customer) {
        if (JSON.stringify(status) === JSON.stringify([])) {
            return "Food not ordered";
        }
        else if (customer === username) {
            return <button type="button" className="btn btn-light" onClick={() => {
                navigate(`/checkout/${booking_id}`)
            }} >Ready For Payment!</button>;
        }
        else {
            return "Waiting for booker to pay";
        }
    }

    // formatting of date
    function formatDate (date){
        const day = date.slice(0,2);   
        const month = date.slice(2,4);
        const year = date.slice(4,6);
        return day + '/' + month + '/' + year;
    }

    if (data.length === 0) {
        return (
            <div className="container">
                <h1 className="text-center"><br/><br/><br/><br/>No bookings made yet!</h1>
            </div>
        );
    }

    if (data.length !== 0) {
        return (
            <div className="history">
                <h1 className="text-center pb-5 pt-4">Your History Table</h1>
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">All</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Pending</button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button" role="tab" aria-controls="contact" aria-selected="false">Paid</button>
                    </li>
                    </ul>
                    <div className="tab-content" id="myTabContent">
                        <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">{getAll()}</div>
                        <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">{getPending()}</div>
                        <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">{getPaid()}</div>
                    </div>
            </div>
        );
    }
}

export default History;