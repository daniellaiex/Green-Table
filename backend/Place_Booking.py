from flask import Flask, request, jsonify
from flask_cors import CORS

import os, sys

from invokes import invoke_http

import amqp_setup
import pika
import json
import random

app = Flask(__name__)
CORS(app)

# URL for other microservices
booking_url = os.environ.get("booking_url") or "http://localhost:5003/booking"
catalog_url = os.environ.get("catalog_url") or "http://localhost:5002/catalog"
customer_url = os.environ.get("customer_url") or "http://localhost:5001/customer"
waitlist_url = os.environ.get("waitlist_url") or "http://localhost:5010/waitlist"

"""
data = {
    "restaurant": "Elemen",
    "customer": "daniel",
    "date_created": "150322",
    "date": "070423",
    "time": "1300",
    "no_of_pax": "4",
    "pax_details": ["mother", "father", "dog"],
}
"""
@app.route("/booking/place_booking", methods=["POST"])
def place_booking():
    amqp_setup.check_setup()
    # Check the input format and data of the request are JSON
    if request.is_json:
        try:
            booking = request.get_json()
            print("\nReceived a booking in JSON:", booking)

            # Start routing
            result = processPlaceBooking(booking)
            return jsonify(result), result["code"]
        
        except Exception as e:
            # Unexpected error
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            ex_str = str(e) + " at " + str(exc_type) + ": " + fname + ": line " + str(exc_tb.tb_lineno)
            print(ex_str)

            return {
                "code": 500,
                "data" : {
                    "message": "place_booking.py internal error: " + ex_str
                }
            }
    
    # Not a JSON request
    return {
        "code": 400,
        "data": {
            "message": "place_booking.py: place_booking() received a non-JSON request"
        }
    }

def processPlaceBooking(booking):
    print("\n\n ----- Processing the booking -----")
    print("\nBooking details:", booking)
    message = json.dumps(booking)
    restaurant_name = booking["restaurant"]
    date = booking["date"]
    time = booking["time"]

    update_availability_data = {
        "restaurant_name": restaurant_name,
        "date": date,
        "time": time,
        "update": -1
    }
    update_availability_result = invoke_http(f'{catalog_url}/updateAvailability', method="PUT", json=update_availability_data)
    update_availability_code = update_availability_result["code"]
    print("Update availability result:", update_availability_result)
    # this happens when the restaurant has no availability for the given date and time
    if update_availability_code not in range(200, 300):
        # Update availability unsuccessful, inform error microservice
        print("\n\n ----- Update availability unsuccessful, table unavailable, sending error message -----")
        amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.error", body=message, properties=pika.BasicProperties(delivery_mode=2))
        # Print status even if invocation fails
        print("\nUpdate availability status ({:d}) published to the RabbitMQ Exchange:".format(update_availability_code), update_availability_result)
        # Add booking to waitlist
        print("\n\n ----- Adding to waitlist -----")
        customer_id = booking["customer"]
        get_customer_result = invoke_http(f'{customer_url}/{customer_id}', method="GET")
        customer_info = get_customer_result["data"]
        waitlist_data = {
            "restaurant_name": restaurant_name,
            "customer": customer_id,
            "phone": customer_info["phone"],
            "email": customer_info["email"],
            "date": date,
            "time": time
        }
        post_waitlist_result = invoke_http(waitlist_url, method="POST", json=waitlist_data)
        code = post_waitlist_result["code"]
        if code not in range(200,300):
            # Waitlist unsuccessful, inform error microservice
            print("\n\n ----- Waitlist unsuccessful, sending error message -----")
            amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.error", body=message, properties=pika.BasicProperties(delivery_mode = 2))

            # Print status even if invocation fails
            print("\nWaitlist status ({:d}) published to the RabbitMQ Exchange:".format(code), post_waitlist_result)
            return {
                "code": 500,
                "data": {
                    "message": "Booking and Waitlist unsuccessful"
                }
            }
        
        print("\n\n ----- Waitlist successful -----")
        return {
            "code": update_availability_code,
            "data": {
                "waitlist_result": post_waitlist_result,
                "message": "No Tables Available for Booking, Added to Waitlist"
            }
        }
    


    # Update availability successful, add booking to database
    
    print("\n\n ----- Update availability successful, table available -----")
    # Generate 8 digit booking id and check if it is unique
    int_id = 0
    while True:
        int_id = random.randint(10000000, 99999999)
        str_id = str(int_id)
        if invoke_http(f'{booking_url}/getBooking/{str_id}', method="GET")["code"] not in range(200, 300):
            break

    # Add booking id to booking
    booking["_id"] = str_id
    
    # add items_ordered and paid_status to booking
    booking["items_ordered"] = []
    booking["paid_status"] = False
    # Add booking to database
    print("\n\n ----- Adding Booking -----")
    add_booking_result = invoke_http(f'{booking_url}/add', method="POST", json=booking)
    code = add_booking_result["code"]

    # Check if booking is added successfully
    if code not in range(200,300):
        # Booking unsuccessful, inform error microservice
        print("\n\n ----- Booking unsuccessful, sending error message -----")
        amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.error", body=message, properties=pika.BasicProperties(delivery_mode = 2))

        # Print status even if invocation fails
        print("\nBooking status ({:d}) published to the RabbitMQ Exchange:".format(code), add_booking_result)

        # Add booking to waitlist
        print("\n\n ----- Adding to waitlist -----")
        customer_id = booking["customer"]
        get_customer_result = invoke_http(f'{customer_url}/{customer_id}', method="GET")
        customer_info = get_customer_result["data"]
        waitlist_data = {
            "restaurant_name": restaurant_name,
            "customer": customer_id,
            "phone": customer_info["phone"],
            "email": customer_info["email"],
            "date": date,
            "time": time
        }
        post_waitlist_result = invoke_http(waitlist_url, "POST", waitlist_data)
        code = post_waitlist_result["code"]
        if code not in range(200,300):
            
            # Waitlist unsuccessful, inform error microservice
            print("\n\n ----- Waitlist unsuccessful, sending error message -----")
            amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.error", body=message, properties=pika.BasicProperties(delivery_mode = 2))

            # Print status even if invocation fails
            print("\nWaitlist status ({:d}) published to the RabbitMQ Exchange:".format(code), post_waitlist_result)
            return {
                "code": 500,
                "data": {
                    "message": "Booking and Waitlist unsuccessful"
                }
            }
        
        return {
            "code": 200,
            "data": {
                "waitlist_result": post_waitlist_result,
                "message": "Booking unsuccessful, added to waitlist"
            }
        }
    
    # Booking successful, send booking confirmation notification
    print("Booking info: ", booking)

    print("\n\n ----- Sending booking confirmation notification -----")
    customer_id = booking["customer"]
    get_customer_result = invoke_http(f'{customer_url}/{customer_id}', method="GET")
    print("customer_info:", get_customer_result)
    customer_info = get_customer_result["data"]
    send_booking_data = {
        "type_of_notification": "sendbooking",
        "data": {
            "phone": customer_info["phone"],
            "email": customer_info["email"],
            "name": customer_info["first_name"],
            "restaurant_name": restaurant_name,
            "date_time": date + " " + time,
            "booking": booking['_id']
        }
    }
    send_booking_message = json.dumps(send_booking_data)
    amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.notification", body=send_booking_message, properties=pika.BasicProperties(delivery_mode = 2))

    # Print status even if invocation fails
    print("\nBooking status ({:d}) published to the RabbitMQ Exchange:".format(code), add_booking_result)

    print("\n\n ----- Booking notification sent, booking successful -----")
    return {
        "code": 200,
        "data": {
            "message": "Booking successful",
            "booking_id": booking["_id"]
        }
    }
    
    # else:
    #     # Table unavailable
    #     print("\n\n ----- Table unavailable -----")

    #     # Add booking to waitlist
    #     print("\n\n ----- Adding to waitlist -----")
    #     customer_id = booking["customer"]
    #     get_customer_result = invoke_http(get_customer_url.replace("<string:customer_id>", customer_id), "GET")
    #     customer_info = get_customer_result["data"]
    #     waitlist_data = {
    #         "restaurant_name": restaurant_name,
    #         "customer": customer_id,
    #         "phone": customer_info["phone"],
    #         "email": customer_info["email"],
    #         "date": date,
    #         "time": time
    #     }
    #     post_waitlist_result = invoke_http(waitlist_url, "POST", waitlist_data)
    #     code = post_waitlist_result["code"]
    #     if code not in range(200,300):
    #         # Waitlist unsuccessful, inform error microservice
    #         print("\n\n ----- Waitlist unsuccessful, sending error message -----")
    #         amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.error", body=message, properties=pika.BasicProperties(delivery_mode = 2))

    #         # Print status even if invocation fails
    #         print("\nWaitlist status ({:d}) published to the RabbitMQ Exchange:".format(code), post_waitlist_result)
    #         return {
    #             "code": 500,
    #             "message": "Booking and waitlist unsuccessful"
    #         }
        
    #     return {
    #         "code": 200,
    #         "data": {
    #             "waitlist_result": post_waitlist_result,
    #             "message": "Booking unsuccessful, added to waitlist"
    #         }
    #     }
    


if __name__ == '__main__':
    app.run(port=5006, debug=True, host="0.0.0.0")
