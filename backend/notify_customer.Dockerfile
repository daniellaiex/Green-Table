FROM python:3-slim
WORKDIR /usr/src/app
COPY amqp.reqs.txt ./
RUN python -m pip install --no-cache-dir -r amqp.reqs.txt
COPY ./Notify_Customer.py ./amqp_setup.py ./invokes.py ./
CMD [ "python", "./Notify_Customer.py" ]