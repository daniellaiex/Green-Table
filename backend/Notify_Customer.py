#!/usr/bin/env python3
# The above shebang (#!) operator tells Unix-like environments
# to run this file as a python3 script

import json
import os

import amqp_setup
from invokes import invoke_http

"""
    data = {
        restaurant_name: "Restaurant 1",
        date: "2021-05-01",
        time: "1200",
    }
"""
waitlist_url = os.environ.get("waitlist_url") or "http://localhost:5010/waitlist"
monitorBindingKey='*.avanotify'

def receiveAvailNotification():
    amqp_setup.check_setup()
    
    queue_name = "NotiCust"   

    # set up a consumer and start to wait for coming messages
    amqp_setup.channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
    amqp_setup.channel.start_consuming() # an implicit loop waiting to receive messages; 
    #it doesn't exit by default. Use Ctrl+C in the command window to terminate it.

def callback(channel, method, properties, body): # required signature for the callback; no return
    print("\nReceived a Notification by " + __file__)
    processAvailNotification(body)
    print() # print a new line feed
def processAvailNotification(avaNotifyMsg):
    try:
        notificationData = json.loads(avaNotifyMsg)
        data = {
            "type_of_notification": "sendnoti",
            "data": {}
        }
        # retrieve wait list of the restaurant and compare the date and time
        # if the date and time match, send notification to the customer
        waitlist = invoke_http(waitlist_url+ "/" +notificationData["restaurant_name"], method='GET')
        # waitlist = json.loads(waitlist)
        if waitlist["code"] == 200:
            for customer, value in waitlist["data"].items():
                if value["date"] == notificationData["date"] and value["time"] == notificationData["time"]:
                    data["data"] = {
                        "name": customer,
                        "phone": value["phone"],
                        "email": value["email"],
                        "restaurant_name": notificationData["restaurant_name"],
                        "date_time": notificationData["date"] + " " + notificationData["time"],
                    }
                amqp_setup.channel.basic_publish(exchange=amqp_setup.exchangename, routing_key="greentable.notification", body=json.dumps(data))
                print("--Notification sent out (JSON):", notificationData)

    except Exception as e:
        print("--NOT JSON:", e)
        print("--DATA:", avaNotifyMsg)
    print()


if __name__ == "__main__":  # execute this program only if it is run as a script (not by 'import')    
    print("\nThis is " + os.path.basename(__file__), end='')
    print(": monitoring routing key '{}' in exchange '{}' ...".format(monitorBindingKey, amqp_setup.exchangename))
    receiveAvailNotification()
