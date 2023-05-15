import React from "react";
import axios from "axios";
import {useState, useEffect} from "react";
import {Link} from "react-router-dom";

function Browse() {

    // API URLS
    const booking_url = "http://34.124.236.222:8000/api/v1/catalog/all";

    // SETTING FILTER FROM SESSION
    var rname = sessionStorage.getItem('rname');
    var rcuisine = sessionStorage.getItem('rcuisine');
    var rdate = sessionStorage.getItem('rdate');

    // remove data
    sessionStorage.removeItem('rname');
    sessionStorage.removeItem('rcuisine');
    sessionStorage.removeItem('rdate');

    // SETTING DATA
    const [data, setData] = useState([]);

        useEffect(() => {
            const all = async () => {
                await axios.get(booking_url)
                .then(
                response => setData(response.data.data))
            }
            all();
        }, []);
        
    // RENDER ALL CARDS
    const ShowPosts = () => {
        return data.map((item, index) => {
            if (id_list.includes(item._id)) {
                return ( 
                    <div className="col-4" key={index}>
                    <div className="card card-smaller" >
                        <img src={item.image[0]} alt='browse card pics'/>
                        <div className="card-body">
                            <div className="row w-100 m-0">
                                <div className="col-6 p-0">
                                    <p className="card-text">{item.avg_rating} &#9733;</p>
                                </div>
                                <div className="col-6 float-end p-0">
                                    <p className="card-text float-end"></p>
                                </div>
                            </div>
                            <h5 className="card-title">{item._id}</h5>
                            <p className="card-text">{item.location.formatted_address}</p>
                            <p className="card-desc">{limitDesc(item.description)}</p>
                            <Link to={`/pdp/${item._id}`}>
                                <button type="submit" className="search-button align-self-end mt-auto">Find out more</button>
                            </Link>
                        </div>
                    </div>
                    </div>
                )
            }
            else {
                return null;
            }
        }
        )
    }

    // SET FILTERS

    if (rname === null) {
        rname = "";
    }
    if (rcuisine === null) {
        rcuisine = "";
    }
    if (rdate === null) {
        rdate = "";
    }

    const [cuisine, setCuisine] = useState(rcuisine);
    const [date, setDate] = useState(rdate);
    const [name, setName] = useState(rname);

    // FUNCTIONS
    // 1. clearAll
    // 2. limitDesc

    // function to clear all filters
    function clearAll() {
        setCuisine("");
        setDate("");
        setName("");
    }

    // function to limit description length
    function limitDesc(desc) {
        if (desc.length > 100) {
            return desc.substring(0, 150) + "...";
        }
        return desc;
    }

    // RENDER
    if (data[0] !== undefined) {
        var id_list = [];
        data.map((each, index) => {
            return id_list.push(each._id);
        })

        // FILTERING
        data.map((item, index) => {
            if (name){
                if (!item._id.toLowerCase().includes(name.toLowerCase())){
                    var temp = id_list.indexOf(item._id);
                    id_list.splice(temp, 1)
                }
            }

            var cuisine_string = item.cuisine.toString();
            var cuisine_lowercase = cuisine_string.toLowerCase();
            if (!cuisine_lowercase.includes(cuisine.toLowerCase())){
                var temp2 = id_list.indexOf(item._id);
                id_list.splice(temp2, 1)
            }

            var availability_keys = Object.keys(item.availability);
            var date_format = date.split("-")
            date_format = date_format[2] + date_format[1] + date_format[0][2] + date_format[0][3]
            if (date_format){
                if (!availability_keys.includes(date_format)){
                    var temp3 = id_list.indexOf(item._id);
                    id_list.splice(temp3, 1)
                }
            } 

            return null;
        })

        return (
            <div className="browse">
                <div className="container">
                    <div className="row">
                        <div className="col-3 filter px-4">
                            <div className='pf'>
                            <div className='row'>
                                <div className="col-6">
                                <p className='float-start'>Filter By</p>
                                </div>
                                <div className="col-6">
                                <button onClick={clearAll} className='float-end clearall'><p>Clear All</p></button>
                                </div>
                            </div>  
                            <form className="search-form">
                                <input className="form-control" id="name" type="text" placeholder="Name" value={name} onChange={(event) => {setName(event.target.value);}}/>
                                <input className="form-control" id="cuisine" type="text" placeholder="Type of cuisine" value={cuisine} onChange={(event) => {setCuisine(event.target.value);}}/>
                                <input className="form-control" id="date" type="date" placeholder="Date" value={date} onChange={(event) => {setDate(event.target.value);}}/>
                                {/* <input className="form-control" type="text" placeholder="No. of pax" value={pax} onChange={(event) => {setPax(event.target.value);}}/> */}
                            </form>
                            </div>
                        </div>
                        <div className="col-9">
                            <div className="row">

                                {ShowPosts(id_list)}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Browse;