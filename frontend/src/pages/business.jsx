import React from "react";
import axios from "axios";
import { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";

function Business() {

    // API URLS
    const booking_url = "http://34.124.236.222:8000/api/v1/booking/";
    const all_url = "http://34.124.236.222:8000/api/v1/catalog/all";

    // SETTING NAVIGATE
    const navigate = useNavigate();

    // SETTING DATA
    const [all, setAll] = useState([]);
    const [data, setData] = useState([]);

        useEffect(() => {
            const all = async () => {
                await axios.get(all_url)
                .then(
                response => setAll(response.data.data))
            }
            all();
        }, []);

    // FUNCTIONS
    // 1. dropdown
    // 2. getBookings
    // 3. goAdd
    // 4. formatStatus
    // 5. printBookings

    // function to create dropdown
    function dropdown () {
        var dropdown = [];
        for (var i = 0; i < all.length; i++) {
            dropdown.push(<option key={i} value={all[i]._id}>{all[i]._id}</option>);
        }
        return dropdown;
    }

    // function to get bookings
    async function getBookings (e) {
        var business_id = e.target.value;
        await axios.get(booking_url + business_id)
        .then((response) => {
            console.log(response.data.data);
            setData(response.data.data);
        }
        )
        .catch((error) => {
            console.log(error);
        });
    }

    // function to go to add page
    function goAdd (e) {
        var booking_id = e.target.parentNode.parentNode.firstChild.innerHTML;
        navigate(`/add/${booking_id}`);
    }

    // function to format status
    function formatStatus(status) {
        if (status === false) {
            return <button onClick={goAdd}>Add/Update Items</button>;
        } 
        else{
            return "Paid";
        }
    }

    // function to print bookings table
    function printBookings () {
        if (data.length !== 0) {
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
                    {data.map((each, index) => (
                        <tr key={index}>
                            <th scope="row">{each._id}</th>
                            <td >{each.restaurant}</td>
                            <td >{each.date}</td>
                            <td >{each.time}</td>
                            <td >{each.no_of_pax}</td>
                            <td >{formatStatus(each.paid_status)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            );
        }
        else {
            return <h3 className="tableerr">No bookings</h3>;
        }
    }

    // RENDER
    if (all.length !== 0) {
        return (
            <div className="business">
                <div className="container">
                    {/* drop down */}
                    <div className="dropdown"><select defaultValue={'first'} onChange={getBookings}><option disabled value={'first'}>Choose a restaurant</option>{dropdown()}</select></div>
                    <div id="bookings">{printBookings()}</div>
                </div>
            </div>
        );
    }
}

export default Business;