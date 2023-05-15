from flask import Flask, jsonify, request
from flask_cors import CORS
import stripe
from dotenv import load_dotenv
import os
load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

app = Flask(__name__)
CORS(app)

"""
    data = {
        "amount": 10000,
        "card_no": "4000000000000002",
        "exp_date": "08/25",
        "cvc": "314"
        }
"""
@app.route('/api/stripepay', methods=['POST'])
def stripepay():
    data = request.get_json()
    # split the exp_date into month and year
    exp_date = data['exp_date'].split('/')
    exp_month = int(exp_date[0])
    exp_year = int(exp_date[1])
    # create a paymentmethod
    pm_string = stripe.PaymentMethod.create(
        type="card",
        card={
            "number": data["card_no"],
            "exp_month": exp_month,
            "exp_year": exp_year,
            "cvc": data["cvc"],
        }
    )
    # convert amount to cents
    amount_converted = int(data["amount"] * 100)
    #create a paymentintent and make payment straight away
    try:
        result = stripe.PaymentIntent.create(
            amount=amount_converted,
            currency='sgd',
            confirm=True,
            payment_method=pm_string['id'])
        print(result)
        return jsonify({"code":200, "data":result}), 200
    except Exception as e:
        print(e)
        return jsonify({"code":400, "data":{"message": f'{e}', "status": "failed"}}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5016, host='0.0.0.0')

