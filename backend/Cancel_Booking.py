from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from invokes import invoke_http
import amqp_setup
import json
load_dotenv()

app = Flask(__name__)
CORS(app)

booking_url = os.environ.get("booking_url") or "http://localhost:5003/booking"
catalog_url = os.environ.get("catalog_url") or "http://localhost:5002/catalog"

"""
data = {
    "restaurant_name": "Elemen",
    "date": "280322",
    "time": "1300",
}
"""
@app.route("/cancel/<string:booking_id>", methods=["POST"])
def cancelBooking(booking_id):
    amqp_setup.check_setup()
    # delete the booking from booking url
    response = request.get_json()
    # retrieve the booking details and hold it for any errors to revert change
    booking_result = invoke_http(booking_url + "/getBooking/" + booking_id, method="GET")
    del_booking_result = invoke_http(booking_url + "/delete/" + booking_id, method="DELETE")
    code = del_booking_result["code"]
    if code not in range(200, 300):
        errorData = {
            "code": 500,
            "message": "Error deleting booking",
            "from": "Cancel_Booking service"
        }
        amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.error", body=json.dumps(errorData))
        return jsonify({"code": 500, "data":{'message': "Error deleting booking"}}), 500
    data = {
            "restaurant_name": response["restaurant_name"],
            "date": response["date"],
            "time": response["time"],
            "update": 1
        }
    print("updating restaurant availability")
        # update the restaurant's availability
    update_result = invoke_http(catalog_url + "/updateAvailability", method="PUT", json=data)
    code = update_result["code"]
    print (update_result)
    if code not in range(200, 300):
        addbooking_result = invoke_http(booking_url + "/booking/add", method="POST", json=booking_result["data"])
        if addbooking_result["code"] == 200:
            errorData = {
                "code": 500,
                "message": "Error updating restaurant availability",
                "from": "Cancel_Booking service"
            }
            amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.error", body=json.dumps(errorData))
            return jsonify({"code": 500, "data":{'message': "Error updating restaurant availability"}}), 500
    if update_result["data"]["new_avail"] == "New availability added":
        amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.avanotify", body=json.dumps(response))
    return jsonify({"code": 200, "data": {"message": "Booking successfully deleted"}}), 200
# delete once tested
    # if code == 200:
    #     data = {
    #         "restaurant_name": response["restaurant_name"],
    #         "date": response["date"],
    #         "time": response["time"],
    #         "update": 1
    #     }
    #     # update the restaurant's availability
    #     update_result = invoke_http(catalog_url + "/updateAvailability", method="PUT", json=data)
    #     code = update_result["code"]
    #     if code == 200:
    #         if update_result["data"]["add_message"] == "New availability added":
    #             amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.avanotify", body=json.dumps(response))
    #         return jsonify({"code": 200, "data": {"message": "Booking successfully deleted"}}), 200
    #     else:
    #         # revert the booking deletion 
    #         addbooking_result = invoke_http(booking_url + "/booking/add", method="POST", json=booking_result["data"])
    #         if addbooking_result["code"] == 200:
    #             errorData = {
    #                 "code": 500,
    #                 "message": "Error updating restaurant availability",
    #                 "from": "Cancel_Booking service"
    #             }
    #             amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.error", body=json.dumps(errorData))
    #             return jsonify({"code": 500, "data":{'message': "Error updating restaurant availability"}}), 500
    # else:
    #     errorData = {
    #         "code": 500,
    #         "message": "Error deleting booking",
    #         "from": "Cancel_Booking service"
    #     }
    #     amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.error", body=json.dumps(errorData))
    #     return jsonify({"code": 500, "data":{'message': "Error deleting booking"}}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5005)