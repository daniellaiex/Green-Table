from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pymongo
from bson.json_util import dumps, loads
from dotenv import load_dotenv
import os
load_dotenv()

Catalog = Flask(__name__)
CORS(Catalog)

client = pymongo.MongoClient(os.environ.get('CATALOG_DB_URL'))
print(client)
db = client["Catalog"]
collection = db["Catalog"]


# Takes a string query and returns JSON object with the fields formatted_address, name, geometry, and photo
@Catalog.route('/catalog/map/<string:query>' , methods=['GET'])
def search(query):
    fields = ['formatted_address', 'name', 'geometry','photo']
    fields_str = ",".join(fields)

    search_endpoint = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'
    payload = {'input': query, 'inputtype': 'textquery', 'fields': fields_str, 'key': os.environ.get('GOOGLE_API_KEY')}

    response = requests.get(search_endpoint, params=payload)
    response_json = response.json()

    return response_json['candidates'][0]

"""
{
    "_id": "Elemen",
    "location": {
        "formatted_address": "9 Raffles Blvd #01-75/75A/76 Millenia Walk",
        "postal_code": "039596"
    },
    "description": "elemen is a dining concept focused on a modern interpretation of natural and meatless cuisine. It is dedicated to fostering the well-being of our customers through our wholesome meatless recipes and use of natural ingredients. Our elemen restaurants offer a pleasant dining experience and our brand motto 'Love Self, Love Earth' explains our focus of serving healthy and natural food, without compromising the sustainability of the environment.",
    "category": "category",
    "image": ["image"],
    "website": "elemengroup.com.sg",
    "cuisine": ["Vegetarian"],
    "phone": "63378888",
    "availability": {
        "270322": {
            "1100": 5,
            "1200": 5,
            "1300": 5,
            "1400": 5,
            "1500": 5,
            "1600": 5,
            "1700": 5,
            "1800": 5,
            "1900": 5,
            "2000": 5,
            "2100": 5
        },
        "280322": {
            "1100": 5,
            "1200": 5,
            "1300": 5,
            "1400": 5,
            "1500": 5,
            "1600": 5,
            "1700": 5,
            "1800": 5,
            "1900": 5,
            "2000": 5,
            "2100": 5
        },
        "290322": {
            "1100": 5,
            "1200": 5,
            "1300": 5,
            "1400": 5,
            "1500": 5,
            "1600": 5,
            "1700": 5,
            "1800": 5,
            "1900": 5,
            "2000": 5,
            "2100": 5
        },
        "300322": {
            "1100": 5,
            "1200": 5,
            "1300": 5,
            "1400": 5,
            "1500": 5,
            "1600": 5,
            "1700": 5,
            "1800": 5,
            "1900": 5,
            "2000": 5,
            "2100": 5
        },
        "310322": {
            "1100": 5,
            "1200": 5,
            "1300": 5,
            "1400": 5,
            "1500": 5,
            "1600": 5,
            "1700": 5,
            "1800": 5,
            "1900": 5,
            "2000": 5,
            "2100": 5
        },
        "010422": {
            "1100": 5,
            "1200": 5,
            "1300": 5,
            "1400": 5,
            "1500": 5,
            "1600": 5,
            "1700": 5,
            "1800": 5,
            "1900": 5,
            "2000": 5,
            "2100": 5
        },
        "020422": {
            "1100": 5,
            "1200": 5,
            "1300": 5,
            "1400": 5,
            "1500": 5,
            "1600": 5,
            "1700": 5,
            "1800": 5,
            "1900": 5,
            "2000": 5,
            "2100": 5
        }
    },
    "avg_rating": 4.0,
    "number_of_ratings": 893
}
"""
# Add a restaurant
@Catalog.route('/catalog/add', methods=['POST'])
def addRestaurant():
    json = request.get_json()
    try:
        collection.insert_one(json)
        # collection.insert_many(json)
        return jsonify({"code": 200, 'data': {"message": 'Restaurant added successfully'}}), 200
    except Exception as e:
        return jsonify({"code": 500, "data": {'message': str(e)}}), 500

# Get all restaurants
@Catalog.route('/catalog/all', methods=['GET'])
def getAll():
    items = collection.find()
    result = loads(dumps(items))
    return jsonify({"code": 200, "data": result}), 200

# Get a restaurant by name
@Catalog.route('/catalog/find/<string:restaurant_name>', methods=['GET'])
def getRestaurant(restaurant_name):
    items = collection.find({"_id": restaurant_name})
    result = loads(dumps(items))
    return jsonify({"code": 200, "data": result[0]}), 200

"""
data = {
    "restaurant_name": "Elemen",
    "date": "270322",
    "time": "1100",
    "update": 1/-1
}
"""
@Catalog.route('/catalog/updateAvailability', methods=['PUT'])
def updateAvailability():
    if request.is_json:
        new = request.get_json()
        return processUpdateAvailability(new)
    else:
        return {"code": 400, "data": {"message": "Request was not JSON"}}, 400

def processUpdateAvailability(obj):
    restaurant_name = obj['restaurant_name']
    # customer_name = obj['c_name']
    date = obj['date']
    time = obj['time']

    doc = collection.find_one({"_id": restaurant_name})
    # Check if the availability for the specified date and time is greater than 0
    # update == 1 means add 1 to the availability, update == -1 means subtract 1 from the availability
    add_message = ""
    if obj["update"] == -1:
        if doc["availability"][date][time] > 0:
            # Subtract 1 from the availability for the specified date and time
            doc["availability"][date][time] -= 1
        else:
            return jsonify({"code": 406, "data": {"message": "No availability for this time slot"}}), 406 # Not Acceptable due to no availability
        # Update the document in the database
    elif obj["update"] == 1:
        if doc["availability"][date][time] == 0:
            # include a message to state that restaurant has new availability
            add_message = "New availability added"
        doc["availability"][date][time] += 1
    collection.update_one({"_id": restaurant_name}, {"$set": {"availability": doc["availability"]}})
    return jsonify({"code": 200, "data": {"message": "Availability updated", "new_avail": add_message}}), 200
        
"""
data = {
    "restaurant_name": "Elemen",
    "rating": 5
}
"""
# rating to be updated in the database (shelved)
@Catalog.route('/catalog/updateRating', methods=['PUT'])
def updateRating():
    json = request.get_json()
    doc = collection.find_one({"_id": json["restaurant_name"]})
    curr_avg = doc["avg_rating"]
    no_of_curr_rating = doc["number_of_ratings"]
    total = float(curr_avg) * float(no_of_curr_rating)
    total += float(json["rating"])
    no_of_curr_rating = no_of_curr_rating + 1
    avg_rating = round(total / no_of_curr_rating, 2)
    try:
        collection.find_one_and_update({"_id": json["restaurant_name"]}, {"$set": {"avg_rating": avg_rating, "number_of_ratings": no_of_curr_rating}})
        return jsonify({"code": 200, "data": {"message": "Rating updated"}}), 200
    except Exception as e:
        return jsonify({"code": 500, "data": {"message": str(e)}}), 500

if __name__ == '__main__':
    Catalog.run(port=5002, debug=True, host="0.0.0.0")
