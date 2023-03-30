import React from "react";
import axios from "axios";
import { useState , useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";

function Add() {
    const {booking_id} = useParams();

    var get_url = "http://localhost:5003/booking/getBooking/";

    var add_url = "http://localhost:5003/booking/updateOrder";

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

    function addtoTable () {
        var exisiting = data.items_ordered;
        var table = [];
        if (exisiting.length !== 0) {
            // loop through dictionary exisitng.items key value and add to table using map
            for (const [key, value] of Object.entries(exisiting.items)) {
                table.push(
                    <tr>
                        <td><input type="text" name="item" placeholder={key}></input></td>
                        <td><input type="text" name="item" placeholder={value[0]}></input></td>
                        <td><input type="text" name="item" placeholder={value[1]}></input></td>
                    </tr>
                );
            }          
        }
        else {
            table.push(
                <tr>
                    <td><input type="text" name="item" placeholder="Item"></input></td>
                    <td><input type='number' step='1' name="quantity" placeholder="Quantity"></input></td>
                    <td><input type='number' step='0.01' name="price" placeholder="Price"></input></td>
                </tr>
            );
        }
        return table;
    }

    // function to insert new row as input fields
    function insertRow () {
        var table = document.getElementById("table");
        console.log(table);
        var row = table.insertRow(1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        cell1.innerHTML = "<input type='text' name='item' placeholder='Item'></input>";
        cell2.innerHTML = "<input type='number' step='1' placeholder='Quantity'></input>";
        cell3.innerHTML = "<input type='number' step='0.01' name='price' placeholder='Price'></input>";
    }

   
// data = {
//     "booking_id": "1",
//     "order": {
//         "items": {
//             "item1": ["quantity", "price"],
//             "item2": ["quantity", "price"],
//             "item3": ["quantity", "price"]
//         }
//         "total": "total price"
//     }
// }


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

        // check if any of the fields are empty
        for (const [key, value] of Object.entries(items)) {
            if (key === "" || value[0] === "" || value[1] === "") {
                putMsgs("Please fill all the fields");
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

    function putMsgs (msg) {
        var msgs = document.getElementById("msgs");
        msgs.innerHTML = msg;
    }

    if (data.length !== 0) {
        return (
            <div className="add">
                <h1>Booking ID: {booking_id}</h1>
                <div id="msgs"></div>
                <div class="table-responsive">
                    <table class="table" id="table">
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