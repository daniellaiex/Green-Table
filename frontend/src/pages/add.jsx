import React from "react";
import axios from "axios";
import { useState , useEffect} from "react";
import { useParams } from "react-router-dom";

function Add() {

    // GET INFO FROM URL
    const {booking_id} = useParams();

    // API URLS
    const get_url = "http://34.124.236.222:8000/api/v1/booking/getBooking/";
    const add_url = "http://34.124.236.222:8000/api/v1/booking/updateOrder";

    // SETTING DATA
    const [data, setData] = useState([]);

    useEffect(() => {
        const all = async () => {
            await axios.get(get_url + booking_id)
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
    }, [booking_id, get_url]);

    // FUNCTIONS
    // 1. addtoTable
    // 2. insertRow
    // 3. updateItems
    // 4. putMsgs
    
    // function to add exisiting items to table
    function addtoTable () {
        var exisiting = data.items_ordered;
        var table = [];
        if (exisiting.length !== 0) {
            for (const [key, value] of Object.entries(exisiting.items)) {
                table.push(
                    <tr>
                        <td><input type="text" name="item" placeholder={key}></input></td>
                        <td><input type="number" name="item" placeholder={value[0]} min={0} max={5000} step={1}></input></td>
                        <td><input type="number" name="item" placeholder={value[1]} min={0} max={5000} step={0.01}></input></td>
                    </tr>
                );
            }          
        }
        else {
            table.push(
                <tr>
                    <td><input type="text" name="item" placeholder="Item"></input></td>
                    <td><input type='number' step={1} name="quantity" placeholder="Quantity" min={0} max={5000}></input></td>
                    <td><input type='number' step={0.01} name="price" placeholder="Price" min={0} max={5000}></input></td>
                </tr>
            );
        }
        return table;
    }

    // function to insert new row as input fields
    function insertRow () {
        var table = document.getElementById("table");
        var row = table.insertRow(1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        cell1.innerHTML = "<input type='text' name='item' placeholder='Item'></input>";
        cell2.innerHTML = "<input type='number' step='1' min='0' max='5000' placeholder='Quantity'></input>";
        cell3.innerHTML = "<input type='number' step='0.01' min='0' max='5000' name='price' placeholder='Price'></input>";
    }

    // function to update items in database
    async function updateItems () {    
        var table = document.getElementById("table");
        var totalprice = 0;
        var items = {};
        for (var i = 1; i < table.rows.length; i++) {
            var item = table.rows[i].cells[0].firstChild.value;
            var quantity = table.rows[i].cells[1].firstChild.value;
            var price = table.rows[i].cells[2].firstChild.value;
            items[item] = [quantity, price];
            totalprice += parseFloat(price);
        }

        for (const [key, value] of Object.entries(items)) {
            if (key === "" || value[0] === "" || value[1] === "") {
                putMsgs("Please fill all the fields");
                return;
            }
        }

        for (const [key, value] of Object.entries(items)) {
            if (Number.isInteger(parseFloat(value[0])) === false || parseFloat(value[1]) < 0 || parseFloat(value[0]) < 0) {
                putMsgs("Quantity must be an integer and non-negative and price must be non-negative");
                console.log(key)
                return;
            }
        }

        console.log(items);
        await axios.post(add_url, {
            booking_id: booking_id,
            order: {
                items: items,
                total: totalprice
            } 
        })
        .then((response) => {
            console.log(response);
            putMsgs(response.data.data.message);
        })
        .catch((error) => {
            console.log(error);
            putMsgs(error.data.data.message);
        });
    }

    // function to put messages
    function putMsgs (msg) {
        var msgs = document.getElementById("msgs");
        msgs.innerHTML = msg;
    }

    // RENDERING
    if (data.length !== 0) {
        return (
            <div className="add">
                <h1>Booking ID: {booking_id}</h1>
                <div id="msgs"></div>
                <div className="table-responsive">
                    <table className="table" id="table">
                        <thead>
                            <tr>
                                <th scope="col">Item</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addtoTable()}
                        </tbody>
                    </table>
                </div>
                <div className="addbtns">
                <button id="insertRow" href="#" onClick={insertRow}>Add New row</button>
                <button className="float-end" onClick={updateItems}>Update Items</button>
                </div>
            </div>
        );
    }
}

export default Add;