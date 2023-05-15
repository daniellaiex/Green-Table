#!/usr/bin/env python3
# The above shebang (#!) operator tells Unix-like environments
# to run this file as a python3 script

import json
import os

import amqp_setup
from invokes import invoke_http
"""
    notificationData = {
        "type_of_notification": "booking",    #sendbooking, sendpayment, sendnoti
        "data": {
            "phone": "12345678",
            "email": "abc@example.com",
            "name": "Nicholas",
            "restaurant_name": "Restaurant 1",
            "date_time": "2021-01-01 12:00:00",
            "booking": "12345678", #only appear in sendbooking and sendpayment
            "amount": "100" #only appear in sendpayment
        }
"""

monitorBindingKey='*.notification'

def receiveNotification():
    amqp_setup.check_setup()
    
    queue_name = "Notification"   

    # set up a consumer and start to wait for coming messages
    amqp_setup.channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
    amqp_setup.channel.start_consuming() # an implicit loop waiting to receive messages; 
    #it doesn't exit by default. Use Ctrl+C in the command window to terminate it.

def callback(channel, method, properties, body): # required signature for the callback; no return
    print("\nReceived a Notification by " + __file__)
    processNotification(body)
    print() # print a new line feed
def processNotification(notificationMsg):
    print("Sending the notification message:")
    try:
        notificationData = json.loads(notificationMsg)
        if notificationData['type_of_notification'] == 'sendbooking':
            URL = "/api/sendbooking"            
        elif notificationData['type_of_notification'] == 'sendpayment':
            URL = "/api/sendpayment"
        elif notificationData['type_of_notification'] == 'sendnoti':
            URL = "/api/sendnoti"
            
        tele_response = invoke_http(os.environ.get("telegram_url")+URL, method='POST', json=notificationData['data'])
        email_respose = invoke_http(os.environ.get("twilio_url")+URL, method='POST', json=notificationData['data'])
        
        print("--Notification sent out (JSON):", notificationData)
        print("--Telegram response:", tele_response)
        print("--Email response:", email_respose)
    except Exception as e:
        print("--NOT JSON:", e)
        print("--DATA:", notificationMsg)
    print()


if __name__ == "__main__":  # execute this program only if it is run as a script (not by 'import')    
    print("\nThis is " + os.path.basename(__file__), end='')
    print(": monitoring routing key '{}' in exchange '{}' ...".format(monitorBindingKey, amqp_setup.exchangename))
    receiveNotification()
