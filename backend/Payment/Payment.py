from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from invokes import invoke_http
load_dotenv()

app = Flask(__name__)
CORS(app)

"""
        data = {
            total_amount: 10000,
            "maincustomer": {
                    "name": "customer1",
                    "amount": 10000,
                    "card_no": "4000000000000002",
                    "exp_date": "08/25",
                    "cvc": "314"
                },
            customer_details: {
                "customer2": {
                    "amount": 10000,
                    "card_no": "4000000000000002",
                    "exp_date": "08/25",
                    "cvc": "314"
                },
                "customer3": {
                    "amount": 10000,
                    "card_no": "4000000000000002",
                    "exp_date": "08/25",
                    "cvc": "314"
                },  
            ...}
        }
"""
# this function doesnt not take into account if maincustomer payment is declined


@app.route('/payment', methods=['POST'])
def payment():
    data = request.get_json()
    total_amount = data['total_amount']
    failed_customers = []
    for customer_name, details in data["customer_details"].items():
        result = invoke_http(os.environ.get("stripe_url"),
                            method='POST', json=details)
        print(result)
        if result["code"] == 200 and result["data"]["status"] == "succeeded":
            total_amount -= details['amount']
        else:
            failed_customers.append(customer_name)
    if total_amount == data["maincustomer"]['amount']:
        del data["maincustomer"]["name"]
        result = invoke_http(os.environ.get("stripe_url"),
                            method='POST', json=data["maincustomer"])
        if result["code"] == 200 and result["data"]["status"] == "succeeded":
            return jsonify({
                "code": 200,
                "data": {"message": "Payment successful", "status": "success"}
            }), 200
    else:
        data["maincustomer"]["amount"] = total_amount
        del data["maincustomer"]["name"]
        result = invoke_http(os.environ.get("stripe_url"),
                            method='POST', json=data["maincustomer"])
        if result["code"] == 200 and result["data"]["status"] == "succeeded":
            return jsonify({
                "code": 200, 
                "data": {"message": f"Payment successful with {len(failed_customers)} failed payments", "failed_payments": failed_customers, "status": "success"}
                }), 200

if __name__ == "__main__":
    app.run(debug=True, port=5004, host='0.0.0.0')
