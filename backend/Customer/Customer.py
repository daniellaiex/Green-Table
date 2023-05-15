from flask import Flask, jsonify, request
from flask_cors import CORS
import pymongo
from bson.json_util import dumps, loads
from dotenv import load_dotenv
from password_hash import hash_password, check_password
import os
load_dotenv()

Customer = Flask(__name__)
CORS(Customer)

client = pymongo.MongoClient(os.environ.get('CUSTOMER_DB_URL'))
db = client["Customer"]
collection = db["Customer"]

"""
data = {
    "_id": "bobbybob",
    "password": "bobthebuilder",
    "phone": "666",
    "telegram": "@bobthebuilder",
    "email": "bob@bob.com",
    "first_name": "Bobby",
    "last_name": "Bob",
    "credit_card": {
        "card_number": "card_number",
        "expiration_date": "expiration_date",
        "security_code": "security_code"
    }
}
"""
@Customer.route('/customer/add', methods=['POST'])
def addCustomer():
    json = request.get_json()
    json["password"] = hash_password(json["password"])
    try:
        collection.insert_one(json)
        return jsonify({"code": 200, "data": {"message": "Customer created successfully"}}), 200
    except Exception as e:
        return jsonify({"code": 500, "data":{'message': str(e)}}), 500


# @Customer.route('/customer/all', methods=['GET'])
# def getAll():
#     items = collection.find({})
#     result = loads(dumps(items))
#     return result, 200


@Customer.route('/customer/<string:customer_id>', methods=['GET'])
def getCustomer(customer_id):
    customers = collection.find({"_id": customer_id})
    result = loads(dumps(customers))
    if len(result) > 0:
        return jsonify({"code": 200, "data": result[0]}), 200
    else:
        return jsonify({"code": 404, "data": {"message": "Invalid Customer ID"}}), 404

"""
data = {
    "customer_id": "bobbybob",
    "password": "bobthebuilder"
    }
"""
@Customer.route('/customer/login', methods=['POST'])
def login():
    data = request.get_json()
    customers = collection.find({"_id": data["customer_id"]})
    result = loads(dumps(customers))
    if len(result) > 0:
        if check_password(data["password"], result[0]["password"]):
            return jsonify({"code": 200, "data": {"message": "Login Successful", "login_status": True}}), 200
        else:
            return jsonify({"code": 401, "data": {"message": "Invalid Password", "login_status": False}}), 401


if __name__ == '__main__':
    Customer.run(port=5001, debug=True, host="0.0.0.0")
