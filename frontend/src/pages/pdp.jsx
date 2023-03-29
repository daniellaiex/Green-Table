import React from "react";
import axios from "axios";
import {useParams, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import {Link} from "react-router-dom";

function Pdp() {

    const booking_url = "http://localhost:5002/catalog/find";

    const add_url = "http://localhost:5006/booking/place_booking";

    const cus_url = "http://localhost:5001/customer";
    
    const {restaurant_name} = useParams();

    const navigate = useNavigate();
    // take data from backend with restaurant_name using axios get

    const [data, setData] = useState([]);
    
    useEffect(() => {
        const all = async () => {
            await axios.get(booking_url + '/' + restaurant_name)
            .then(
            response => setData(response.data.data))
        }
        all();
    }, [restaurant_name]);

    // format date to dd/mm/yyyy
    const formatDate = (date) => {
        const day = date.slice(0,2);   
        const month = date.slice(2,4);
        const year = date.slice(4,6);
        return day + '/' + month + '/' + year;
    }

    const [chosenDate, setChosenDate] = useState('');

    // functions to render time based on the date selected

    function renderDates(){
        return Object.keys(data.availability).map((key, index) => {
           return <option value={key}>{formatDate(key)}</option>
        })
    }

    function renderTimes(check){
        if (check !== '')
            return Object.keys(data.availability[chosenDate]).map((key, index) => {
                return <option value={key}>{key}</option>
        })
        else{
            return <option selected value="null" disabled>Please Select A Time</option>
        }
    }

    function handleChange(e){
        setChosenDate(e.target.value);
    }

    function splitPhone(phone){
        return phone.slice(0,4) + ' ' + phone.slice(4,8);
    }

    async function addBooking(){
        document.getElementById("error1").innerHTML = "";
        document.getElementById("error2").innerHTML = "";
        // get elemtns from class name customerids and put into an array
        var temp = document.getElementsByClassName("customerids");
        var customerids = [];
        for (var i = 1; i < temp.length; i++){
            if (temp[i].value === ""){
                errorMsg(2);
            }
            else{
                const result = await checkName(temp[i].value);
                console.log(result);
                if (result !== '' && result.code === 200){
                    console.log(temp[i].value);
                    customerids.push(temp[i].value);
                }
            }
        }

        // if either error1 or error2 is not empty, exit function addBooking
        if (document.getElementById("error1").innerHTML === "" && document.getElementById("error2").innerHTML === ""){
            const booking = {
                restaurant: data._id,
                customer: sessionStorage.getItem("name"),
                // date DDMMYY
                date_created: formatBD(new Date().toLocaleDateString()),
                date: document.getElementById("date").value,
                time: document.getElementById("time").value,
                no_of_pax: document.getElementById("pax").value,
                pax_details: customerids
            }
            sessionStorage.setItem("booking_data", JSON.stringify(booking));
            axios.post(add_url, booking)
            .then(
                response => {
                    const booking_id = response.data.data.booking_id;
                    navigate(`/confirmation/${booking_id}`)
                }
            )
            .catch(
                error => console.log(error)
            )
        }
    }

    async function checkName(name){
        var temp = ''
        await axios.get(cus_url + '/' + name)
        .then((res) => {
            console.log(res.data);
            temp = res.data;
        })
        .catch((err) => {
            console.log(err);
            errorMsg(1);
        })
        return temp;
    }

    function errorMsg(num){
        if (num === 1){
            if (document.getElementById("error1").innerHTML === ""){
                document.getElementById("error1").innerHTML = "Please enter a valid name";
            }
        }
        if (num === 2){
            if (document.getElementById("error2").innerHTML === ""){
                document.getElementById("error2").innerHTML = "Please fill in all the fields";
            }
        }
    }

    function checkLogin(){
        if (!sessionStorage.getItem("name")){
            return <Link to={"/login"}><button type="submit" className="search-button align-self-end mt-auto">Login to Book</button></Link>
        }
        else{
            return <button type="submit" className="search-button align-self-end mt-auto" onClick={async (e) => {
                e.preventDefault();
                await addBooking();
            }}>Book Now</button>
        }
    }


    function formatBD(date){
        var temp = date.split('/');
        return temp[0] + temp[1] + temp[2][2]+ temp[2][3];
    }

    function customerFields(){
       // get value if input id = pax and put the number of input fields within the div id = customerfields
         // if pax = 3, then 3 input fields
        var pax = document.getElementById("pax").value;
        var customerfields = document.getElementById("customerfields");
        if (pax>0){
            customerfields.innerHTML = "";
            var input = document.createElement("input");
                input.type = "text";
                input.className = "form-control customerids";
                input.placeholder = `${sessionStorage.getItem("name")}`;
                input.value = `${sessionStorage.getItem("name")}`;
                input.disabled = true;
                input.style = "width: 80%;"
                customerfields.appendChild(input);
            for (var i = 1; i < pax; i++){
                var minput = document.createElement("input");
                minput.type = "text";
                minput.className = "form-control customerids";
                minput.placeholder = `Name ${i+1}`;
                minput.style = "width: 80%;"
                customerfields.appendChild(minput);
            }
        }
    }


    if (data.length !== 0) {
        return (
            <div className="pdp">
                <div className="container mt-5">
                    <div className="row pdprow">
                        <div className="col-8 mx-3">
                            <div className="pdpmain">
                                <div className="tt row">
                                    <div className="col">
                                        <h4 className="pdpheaders">{data._id}</h4>
                                    </div>
                                    <div className="col">
                                        <p className="float-end pdpmoney">$$</p>
                                    </div>
                                </div>
                                <img src={data.image[1]} className='pdpimg' alt="/"/>
                            </div>
                            <div className="pdpdesc">
                                <h4 className="pdpheaders">About</h4>
                                <div className="tt row">
                                    <div className="col-8">
                                        <p className="pdpdesc-title">Location</p>
                                        <p className="pdpdesc-desc">{data.location.formatted_address}<br/>Singapore {data.location.postal_code}</p>
                                        <p className="pdpdesc-title">Cuisine</p>
                                        <p className="pdpdesc-desc">{data.cuisine}</p>
                                        <p className="pdpdesc-title">Website</p>
                                        <p className="pdpdesc-desc">{data.website}</p>
                                        <p className="pdpdesc-title">Description</p>
                                        <p className="pdpdesc-desc">{data.description}</p>
                                    </div>
                                    <div className="col-4">
                                        <p className="pdpdesc-title">Opening Hours</p>
                                        <p className="pdpdesc-desc">Mon - Fri: 8am - 10pm<br/>Sat - Sun: 8am - 10pm</p>
                                        <p className="pdpdesc-title">Contact</p>
                                        <p className="pdpdesc-desc">+65 {splitPhone(data.phone)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-3 test mx-3">
                            <div className="pdpbooking">
                                <h5>Find a table</h5>
                                <div className="pdpbox">
                                    <form className="search-form">
                                        <select onChange={handleChange} id='date'>
                                            <option selected value="null" disabled>Please Select A Date</option>
                                            {renderDates()}
                                        </select>
                                        <select id="time">
                                            {renderTimes(chosenDate)}
                                        </select>
                                        <input type='number' placeholder="No. of Pax" id="pax" onChange={customerFields}/>
                                        <div id="customerfields"></div>
                                        <div id="error1"></div>
                                        <div id="error2"></div>
                                        <div>
                                            {checkLogin()}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Pdp;