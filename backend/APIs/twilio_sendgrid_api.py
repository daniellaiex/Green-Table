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
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
        return {'message': 'Email Sent with no errors'}, response.status_code
    except Exception as e:
        return {'message': e}, e['code']

"""
    data = {
        "email": "abc@example.com"
        "subject": "Booking Confirmation",
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
        from_email='nicholasgbr99@gmail.com',
        to_emails=data['email'],
        subject=data['subject'],
        html_content=f'Dear {data["name"]}, <br><br> your booking {data["booking"]} is confirmed. <br> Name of Restaurant: {data["restaurant_name"]} <br> Date & Time: {data["date_time"]}')  # edit this message
    send_email(message)
    return jsonify({'message': 'Email sent successfully'}), 200

# 2. send waitlist available email
@app.route('/api/sendnoti', methods=['POST'])
def send_noti():
    data = request.get_json()
    message = Mail(
        from_email='nicholasgbr99@gmail.com',
        to_emails=data['email'],
        subject=data['subject'],
        html_content='<strong>and easy to do anywhere, even with Python</strong>')  # edit this message
    send_email(message)
    return jsonify({'message': 'Email sent successfully'}), 200

# 3. send payment confirmation email
@app.route('/api/sendpayment', methods=['POST'])
def send_payment():
    data = request.get_json()
    message = Mail(
        from_email='nicholasgbr99@gmail.com',
        to_emails=data['email'],
        subject=data['subject'],
        html_content=f'Dear {data["name"]}, <br><br> your booking {data["booking"]} payment is successful. <br> Name of Restaurant: {data["restaurant_name"]} <br> Date & Time: {data["date_time"]}')  # edit this message
    send_email(message)
    return jsonify({'message': 'Email sent successfully'}), 200


# main driver function
if __name__ == '__main__':
    app.run(debug=True, port=5014, host='0.0.0.0')