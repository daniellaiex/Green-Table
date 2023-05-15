import React from "react";
import { useLocation } from "react-router-dom";

function Navbar() {
    
    var username = sessionStorage.getItem('name');
    useLocation();
    function history(username){
      if (username === 'Business') {
        return(
          <div className="links">
          <a className="navbar-brand" href=".">GreenTable</a>
          <a className="navbarlinks" href="/business">Home</a>
          <a className="navbarlinks" href="/logout">Logout</a>
          </div>
        )
      }

      else if(username){
        return(
          <div className="links">
            <a className="navbar-brand" href="/">GreenTable</a>
            <a className="navbarlinks" href="/">Home</a>
            <a className="navbarlinks" href="/browse">Booking</a>
            <a className="navbarlinks" href="/history">History</a>
            <a className="navbarlinks" href="/logout">Logout</a>
          </div>
        )
      }

      else {
        return(
        <div className="links">
          <a className="navbar-brand" href="/">GreenTable</a>
          <a className="navbarlinks" href="/">Home</a>
          <a className="navbarlinks" href="/browse">Booking</a>
          <a className="navbarlinks" href="/login">Login</a>
          <a className="navbarlinks" href="/signup">Signup</a>
        </div>
        )
      }
    }

    return (
        <nav className="navbar">
        <div className="container-fluid">
          {history(username)}
          {/* <form className="d-flex" role="search">
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form> */}
        </div>
      </nav>
    );
}

export default Navbar;