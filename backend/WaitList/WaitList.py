from flask import Flask, jsonify, request
from flask_cors import CORS
import pymongo
from bson.json_util import dumps, loads
from dotenv import load_dotenv
import os
load_dotenv()

app = Flask(__name__)
CORS(app)

client = pymongo.MongoClient(os.environ.get('WAITLIST_DB_URL'))
db = client["WaitList"]
collection = db["WaitList"]
# query data
# items = collection.find()
# for item in items:
#     print(item)
# insert data
# collection.insert_one({"_id":"kFC", "restaurant_name": "test2", "name": "tes2t", "size": 2, "status": "waiting"})
# collection.insert_many([{"name": "test1", "age": 18}, {"name": "test2", "age": 18}])


@app.route('/waitlist/<string:restaurant_name>', methods=['GET'])
def getWaitList(restaurant_name):
    items = collection.find({"_id": restaurant_name})
    result = loads(dumps(items))
    if len(result) == 0:
        return jsonify({"code": 404, "data":{'message': 'Restaurant WaitList not found'}}), 404
    return jsonify({"code": 200, "data": result[0]["customers"]}), 200

"""
    data = {
        "restaurant_name": "Restaurant 1",
        "customer": "Customer 1",
        "phone": "12345678",
        "email": "abc@example.com",
        "date": "2021-01-01",
        "time": "1200HRS"
        }
"""
@app.route('/waitlist', methods=['POST'])
def postWaitList():
    data = request.get_json()
    # search if restaurant exists
    result = loads(dumps(collection.find({"_id": data["restaurant_name"]})))
    if len(result) == 0:
        data_put = {
            "_id": data["restaurant_name"],
            "customers": {
                data["customer"]: {
                    "phone": data["phone"],
                    "email": data["email"],
                    "date": data["date"],
                    "time": data["time"],
                }
            }
        }
        try:
            collection.insert_one(data_put)
        except Exception as e:
            return jsonify({"code": 500, "data":{'message': str(e)}}), 500
    else:
        data_put = {
                "phone": data["phone"],
                "email": data["email"],
                "date": data["date"],
                "time": data["time"],
            }
        result[0]["customers"][data["customer"]] = data_put
        result_put = result[0]["customers"]
        try:
            collection.update_one({"_id": data["restaurant_name"]}, {"$set": {"customers": result_put}})
        except Exception as e:
            return jsonify({"code": 500, "data":{'message': str(e)}}), 500
        
    return jsonify({"code": 200, "data": {'message': 'WaitList added successfully'}}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5010)