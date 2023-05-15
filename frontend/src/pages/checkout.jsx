import React from "react";
import axios from "axios";
import { useState , useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";

function Checkout() {

    // GET INFO FROM URL
    const {booking_id} = useParams();

    // API URLS
    const booking_url = "http://34.124.236.222:8000/api/v1/booking/getBooking/";
    const pay_url = "http://34.124.236.222:8000/api/v1/pay";

    // SETTING NAVIGATE
    const navigate = useNavigate();


    // SETTING DATA
    const [data, setData] = useState([]);

    useEffect(() => {
        const all = async () => {
            await axios.get(booking_url + booking_id)
            .then((response) => {
                console.log(response.data.data);
                setData(response.data.data);
            }
            )
            .catch((error) => {
                console.log(error);
            });
        }
        all();
    }, [booking_id, booking_url]);

    // FUNCTIONS
    // 1. changeDisabledTrue
    // 2. changeDisabled
    // 3. getIndividualPrice
    // 4. getItems
    // 5. makePayment
    // 6. formatDate
    // 7. formatTime
    // 8. formatPrice
    // 9. getGST
    // 10. getSC
    // 11. getTotal
    // 12. pError

    // function when click auto pay
    function changeDisabledTrue() {
        var inputs = document.getElementById("inputfields")
        inputs.innerHTML = "";
        var ppl = [data.customer];
        for (var i = 0; i <  data.pax_details.length; i++) {
            ppl.push(data.pax_details[i]);
        }
        var indiv = getTotal(data.items_ordered.total) / ppl.length;
        for (var key in ppl) {
            inputs.innerHTML += `<div class="row" key=${key}>
            <div class="col">
                <p class="card-text cn names" value=${ppl[key]}>${ppl[key]}</p>
            </div>
            <div class="col">
                <input class="card-text float-end topays" type='number' step='0.01' value=${formatPrice(indiv)} placeholder=${formatPrice(indiv)} disabled/>
            </div>
        </div> `
        }

        document.getElementById("splitbtn").style.setProperty ("color", "white", "important");
        document.getElementById("splitbtn").style.setProperty ("background-color", "#122526", "important");
        document.getElementById("splitbtn2").style.setProperty ("color", "#122526", "important");
        document.getElementById("splitbtn2").style.setProperty ("background-color", "white", "important");
    }

    // function when click manual pay
    function changeDisabled() {
        var inputs = document.getElementById("inputfields")
        inputs.innerHTML = "";
        var ppl = [data.customer];
        for (var i = 0; i <  data.pax_details.length; i++) {
            ppl.push(data.pax_details[i]);
        }
        for (var key in ppl) {
            inputs.innerHTML += `<div class="row" key=${key}>
            <div class="col">
                <p class="card-text cn names" value=${ppl[key]}>${ppl[key]}</p>
            </div>
            <div class="col">
                <input class="card-text float-end topays headache" type='number' step='0.01'/>
            </div>
        </div> `
        }
  
        document.getElementById("splitbtn2").style.setProperty ("color", "white", "important");
        document.getElementById("splitbtn2").style.setProperty ("background-color", "#122526", "important");
        document.getElementById("splitbtn").style.setProperty ("color", "#122526", "important");
        document.getElementById("splitbtn").style.setProperty ("background-color", "white", "important");

    }

    // function to get price to pay for each person
    function getIndividualPrice(){
        var ppl = [data.customer];
        for (var i = 0; i <  data.pax_details.length; i++) {
            ppl.push(data.pax_details[i]);
        }
        var indiv = getTotal(data.items_ordered.total) / ppl.length;
        var items = [];
        for (var key in ppl) {
            items.push(
                <div className="row" key={key}>
                    <div className="col">
                        <p className="card-text cn names" value={ppl[key]}>{ppl[key]}</p>
                    </div>
                    <div className="col">
                        <input className="card-text float-end topays" type='number' step='0.01' value={formatPrice(indiv)} placeholder={formatPrice(indiv)} disabled/>
                    </div>
                </div> 
            );
        }
        return items;
    }

    // function to get items ordered
    function getItems(){
        var dict = data.items_ordered.items;
        var items = [];
        for (var key in dict) {
            items.push(
                <div className="row" key={key}>
                    <div className="col-8">
                        <p className="card-text">{key}</p>
                    </div>
                    <div className="col-2">
                        <p className="card-text float-end">x{dict[key][0]}</p>
                    </div>
                    <div className="col-2">
                        <p className="card-text float-end">${formatPrice(dict[key][1])}</p>
                    </div>
                </div>
            );
        }
        return items;
    }

    // function to make payement
    async function makePayment(){
        document.getElementById("errormsg").innerHTML = "";
        var amounts = []
        var temp = [];
        var names = document.getElementsByClassName("names");
        var topays = document.getElementsByClassName("topays");
        for (var i = 1; i < names.length; i++) {
            var obj = {
                name: names[i].innerHTML,
                amount: parseFloat(topays[i].value)
            }
            temp.push(obj);
            amounts.push(parseFloat(topays[i].value));
        }

        pError();

        if (document.getElementById("errormsg").innerHTML !== "") {
            return;
        }

        amounts.unshift(parseFloat(document.getElementsByClassName("topays")[0].value));

        sessionStorage.setItem('paid', amounts);

        var info = {
            booking_id: booking_id,
            total_amount: parseFloat(formatPrice(getTotal(data.items_ordered.total))),
            main_customer: {
                name: document.getElementsByClassName("names")[0].innerHTML,
                amount: parseFloat(document.getElementsByClassName("topays")[0].value)
            },
            other_customers: temp
        }

        await axios.post(pay_url, info)
        .then((res) => {
            console.log(res.data);
            var failed = res.data.data.failed_payments
            sessionStorage.setItem("failed", failed)
            navigate("/pconfirm/" + booking_id);
        })
        .catch((err) => {
            console.log(err);
        })
    }

    // function to format date
    function formatDate (date) {
        const day = date.slice(0,2);   
        const month = date.slice(2,4);
        const year = date.slice(4,6);
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        var monthIndex = month - 1;
        var monthName = monthNames[monthIndex];
        var d = new Date(year, month, day);
        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        var n = weekday[d.getDay()];
        return day + ' ' + monthName + ' 20' + year + ', ' + n;
    }

    // function to format time
    function formatTime (time) {
        const hour = time.slice(0,2);
        const min = time.slice(2,4);
        var ampm = hour >= 12 ? 'pm' : 'am';
        var hour12 = hour % 12;
        hour12 = hour12 ? hour12 : 12; 
        var strTime = hour12 + ':' + min + ' ' + ampm;
        return strTime;
    }

    // function to format price
    function formatPrice(price) {
        var pricee = parseFloat(price).toFixed(2);
        return pricee;
    }

    // function to get GST
    function getGST(price){
        var gst = price * 0.08;
        return gst;
    }

    // function to get service charge
    function getSC(price){
        var sc = price * 0.1;
        return sc;
    }

    // function to get total price
    function getTotal(price){
        var total = parseFloat(price) + parseFloat(getGST(price)) + parseFloat(getSC(price));
        return total;
    }

    // function to check if total amount paid is equal to total amount due
    function pError(){
        var topays = document.getElementsByClassName("topays");
        var total = 0;
        for (var i = 0; i < topays.length; i++) {
            total += parseFloat(topays[i].value);
        }
        if (total !== parseFloat(formatPrice(getTotal(data.items_ordered.total)))) {
            return (
                document.getElementById("errormsg").innerHTML = "Total amount paid does not match total amount due."
            );
        }
    }

    // RENDERING
    if (data.length !== 0) {
        return (
            <div className="checkout py-5">
                <div className="container">
                <div className="tt row">

                    <div className="col-6">
                        <div className="card">
                        <div className="card-body">
                            <h3 className="card-title text-center">Your E-receipt</h3>

                            <hr/>
                            
                            <p className="card-text rsname">{data.restaurant}</p>
                            <div className="row">
                                <div className="col-4">
                                    <p className="card-text">Date:</p>
                                </div>
                                <div className="col-8">
                                    <p className="card-text">{formatDate(data.date)}</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-4">
                                    <p className="card-text">Time:</p>
                                </div>
                                <div className="col-8">
                                    <p className="card-text">{formatTime(data.time)}</p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-4">
                                    <p className="card-text">No. of pax:</p>
                                </div>
                                <div className="col-8">
                                    <p className="card-text">{data.no_of_pax}</p>
                                </div>
                            </div>
                            <hr/>
                            <div className="row receiptbold">
                                <div className="col-8">
                                    <p className="card-text">Items</p>
                                </div>
                                <div className="col-2">
                                    <p className="card-text float-end">Qty</p>
                                </div>
                                <div className="col-2">
                                    <p className="card-text float-end">Price</p>
                                </div>
                            </div>
       
                            {getItems()}

                            <hr/>

                            <div className="row receiptbold">
                                <div className="col">
                                    <p className="card-text">Subtotal (SGD)</p>
                                </div>
                                <div className="col">
                                    <p className="card-text float-end">${formatPrice(data.items_ordered.total)}</p>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <p className="card-text">GST (8%)</p>
                                </div>
                                <div className="col">
                                    <p className="card-text float-end">${formatPrice(getGST(data.items_ordered.total))}</p>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <p className="card-text">Service Charge (10%)</p>
                                </div>
                                <div className="col">
                                    <p className="card-text float-end">${formatPrice(getSC(data.items_ordered.total))}</p>
                                </div>
                            </div>

                            <hr/>

                            <div className="row receiptbold">
                                <div className="col">
                                    <p className="card-text">Total (SGD)</p>
                                </div>
                                <div className="col">
                                    <p className="card-text float-end" id="totalprice">${formatPrice(getTotal(data.items_ordered.total))}</p>
                                </div>
                            </div>

                            <hr/>
                        </div>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="card">
                        <div className="card-body">
                        <h3 className="card-title text-center">Split Payment</h3>
                            <hr/>
                            <div className="tt row split">
                                <div className="col text-center">
                                    <button type="button" className="btn splitbtn" id="splitbtn" onClick={changeDisabledTrue}>Split Evenly</button>
                                </div>
                                <div className="col text-center">
                                    <button type="button" className="btn splitbtn2" id="splitbtn2" onClick={changeDisabled}>Split Manually</button>
                                </div>
                            </div>

                            <div className="row receiptbold">
                                <div className="col">
                                    <p className="card-text">Customer Name</p>
                                </div>
                                <div className="col">
                                    <p className="card-text float-end">Amount</p>
                                </div>
                            </div>

                            <div id="inputfields">
                                {getIndividualPrice()}
                            </div>

                            <div id="errormsg">
                            </div>

                            <div className="btndiv text-center">
                                <button type="button" className="btn paybtn" onClick={async (e) => {
                                    e.preventDefault();
                                    await makePayment();
                                }}>Pay</button>
                            </div>

                        </div>
                        </div>
                    </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default Checkout;