from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

def send_email(message):
    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        print(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
        return {"code": 200, "data":{'message': 'Email sent successfully'}}
    except Exception as e:
        print(e)
        return {"code": 400, "data":e}

"""
    # for booking confirmation
    data = {
        "email": "abc@example.com"
        "name": "Nicholas",
        "booking": "12345678",
        "restaurant_name": "Restaurant 1",
        "date_time": "2021-01-01 12:00:00"
    }
"""
# 1. send booking confirmation email
@app.route('/api/sendbooking', methods=['POST'])
def send_booking():
    data = request.get_json()
    message = Mail(
        from_email='greentable.esd6@gmail.com',
        to_emails=data['email'],
        subject=f'Booking Confirmation for {data["restaurant_name"]}',
        html_content=f'Dear {data["name"]}, <br><br> your booking {data["booking"]} is confirmed. <br> Name of Restaurant: {data["restaurant_name"]} <br> Date & Time: {data["date_time"]}')  # edit this message
    result = send_email(message)
    if result["code"] != 200:
        return jsonify({"code": 400, "data":{'message': 'Email sent failed'}}), 400
    return jsonify({"code": 200, "data":{'message': 'Email sent successfully'}}), 200


"""
    # for waitlist available
    data = {
        "email": "abc@example.com"
        "name": "Nicholas",
        "restaurant_name": "Restaurant 1",
        "date_time": "2021-01-01 12:00:00"
    }
"""
# 2. send waitlist available email
@app.route('/api/sendnoti', methods=['POST'])
def send_noti():
    data = request.get_json()
    message = Mail(
        from_email='greentable.esd6@gmail.com',
        to_emails=data['email'],
        subject=f"Notification of New {data['restaurant_name']} Availability",
        html_content=f'Dear {data["name"]}, <br><br> There is a new availability for {data["restaurant_name"]} on {data["date_time"]}. Go and Book now before it gets taken up!')  # edit this message
    result = send_email(message)
    if result["code"] != 200:
        return jsonify({"code": 400, "data":{'message': 'Email sent failed'}}), 400
    return jsonify({"code": 200, "data":{'message': 'Email sent successfully'}}), 200
"""
    # for payment confirmation
    data = {
        "email": "abc@example.com"
        "name": "Nicholas",
        "booking": "12345678",
        "restaurant_name": "Restaurant 1",
        "date_time": "2021-01-01 12:00:00",
        "amount": "100"
    }
"""
# 3. send payment confirmation email
@app.route('/api/sendpayment', methods=['POST'])
def send_payment():
    data = request.get_json()
    message = Mail(
        from_email='greentable.esd6@gmail.com',
        to_emails=data['email'],
        subject=f'Payment Confirmation for {data["booking"]}',
        html_content=f'Dear {data["name"]}, <br><br> your booking {data["booking"]} payment is successful. <br> Name of Restaurant: {data["restaurant_name"]} <br> Date & Time: {data["date_time"]} <br> Amount Paid: {data["amount"]}')  # edit this message
    result = send_email(message)
    if result["code"] != 200:
        return jsonify({"code": 400, "data":{'message': 'Email sent failed'}}), 400
    return jsonify({"code": 200, "data":{'message': 'Email sent successfully'}}), 200


# main driver function
if __name__ == '__main__':
    app.run(debug=True, port=5014, host='0.0.0.0')
