FROM python:3-slim
WORKDIR /usr/src/app
COPY requirements.txt ./
RUN python -m pip install --no-cache-dir -r requirements.txt
COPY ./twilio_sendgrid_api.py ./
CMD [ "python", "./twilio_sendgrid_api.py" ]