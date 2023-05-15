from telethon import TelegramClient, events, sync
from telethon.tl.types import InputPhoneContact
from telethon.tl.functions.contacts import ImportContactsRequest, DeleteContactsRequest
from dotenv import load_dotenv
import os
from quart import Quart, request, jsonify
from quart_cors import cors 

load_dotenv()

app = Quart(__name__)
cors(app)
api_id = os.getenv("TELEGRAM_API_ID")
api_hash = os.getenv("TELEGRAM_API_HASH")
# Initialise telegram client with API codes
client = TelegramClient(os.getenv("TELEGRAM_API_SESSION"), api_id, api_hash)

async def send_message(user_details, message_content, name):
    new_contact = ""
    entity = ""
    # Start the process
    try:
        await client.start()
    except Exception as e:
        print(e)
        return {"code": 400, 'message': e}
    # Get the entity of the user, if not found, create a new contact
    try:
        entity = await client.get_entity(user_details)
        print(entity)
    except Exception as e:
        print(e)
        new_contact = InputPhoneContact(client_id=0, phone=user_details, first_name=name, last_name="")
    # Send the message and delete the contact if it is a new contact
    try:
        # Send the message
        if new_contact != "":
            await client(ImportContactsRequest([new_contact])) # error occurs here if too many requests
            entity = await client.get_entity(user_details)
        await client.send_message(user_details, message_content)
        if new_contact != "":
            await client(DeleteContactsRequest(id=[entity]))
        # Disconnect the client
        await client.disconnect()
        return {"code": 200, 'message': 'Message sent successfully'}
    except Exception as e:
        print(e)
        # Disconnect the client
        if client.is_connected():
            if new_contact != "" and entity != "":
                await client(DeleteContactsRequest(id=[entity]))
            await client.disconnect()
        return {"code": 400, 'message': e}
    

"""
    data = {
        "phone": "12345678",
        "name": "Nicholas",
        "booking": "12345678",
        "restaurant_name": "Restaurant 1",
        "date_time": "2021-01-01 12:00:00"
    }
"""
@app.route('/api/sendbooking', methods=['POST'])
async def send_booking():
    data = await request.get_json()
    user_details = "+65" + data['phone']
    message_content = f'Dear {data["name"]}, this message is to inform you that your booking {data["booking"]} is confirmed. \n Name of Restaurant: {data["restaurant_name"]} \n Date & Time: {data["date_time"]}'
    result = await send_message(user_details, message_content, data["name"])
    if result["code"] != 200:
        return jsonify({"code": 400, "data":{'message': 'Message sent failed'}}), 400
    return jsonify({"code": 200, "data":{'message': 'Message sent successfully'}}), 200

"""
    # for waitlist available
    data = {
        "phone": "12345678"
        "name": "Nicholas",
        "restaurant_name": "Restaurant 1",
        "date_time": "2021-01-01 12:00:00"
    }
"""
@app.route('/api/sendnoti', methods=['POST'])
async def send_noti():
    data = await request.get_json()
    user_details = "+65" + data['phone']
    message_content = f'Dear {data["name"]}, \n\n There is a new availability for {data["restaurant_name"]} on {data["date_time"]}. \n\n Go and Book now before it gets taken up!'
    result = await send_message(user_details, message_content, data['name'])
    if result["code"] != 200:
        return jsonify({"code": 400, "data":{'message': 'Message sent failed'}}), 400
    return jsonify({"code": 200, "data":{'message': 'Message sent successfully'}}), 200

"""
    # for payment confirmation
    data = {
        "phone": "12345678"
        "name": "Nicholas",
        "booking": "12345678",
        "restaurant_name": "Restaurant 1",
        "date_time": "2021-01-01 12:00:00",
        "amount": "100"
    }
"""
@app.route('/api/sendpayment', methods=['POST'])
async def send_payment():
    data = await request.get_json()
    user_details = "+65" + data['phone']
    message_content = f'Dear {data["name"]}, \n\n your booking {data["booking"]} payment is successful. \n Name of Restaurant: {data["restaurant_name"]} \n Date & Time: {data["date_time"]} \n Amount Paid: {data["amount"]}'
    result = await send_message(user_details, message_content, data['name'])
    if result["code"] != 200:
        return jsonify({"code": 400, "data":{'message': 'Message sent failed'}}), 400
    return jsonify({"code": 200, "data":{'message': 'Message sent successfully'}}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5015, host='0.0.0.0', use_reloader=True)

