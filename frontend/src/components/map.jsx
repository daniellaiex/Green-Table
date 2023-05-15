import React from 'react'
import {useEffect, useState} from 'react'
import GoogleMapReact from 'google-map-react'
import { Icon } from '@iconify/react'
import axios from "axios";

const LocationPin = () => (
<div className="pin">
    <Icon icon='mdi:map-marker'  width="40" height="40" color='red' className="pin-icon" />
</div>
)

function Map(props) {
    let query = props.name

    const [data, setData] = useState([]);

    useEffect(() => {
        const getLocation = async () => {
            await axios.get(`http://34.124.236.222:8000/api/v1/catalog/map/` + query)
            .then(
            response => setData(response.data.geometry.location))
        }
        getLocation();
    }, [query]);

    // console.log(data)
    // console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
    
    return (
        <div className="map">

            <div className="google-map" style={{height: 500, width: 500}}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY}}
                center={data}
                defaultZoom={17}
            >
                <LocationPin
                lat={data.lat}
                lng={data.lng}
                />
            </GoogleMapReact>
            </div>
        </div>
    )
}

export default Map

