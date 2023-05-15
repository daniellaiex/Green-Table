FROM python:3-slim
WORKDIR /usr/src/app
COPY http.reqs.txt ./
COPY amqp.reqs.txt ./
RUN python -m pip install --no-cache-dir -r amqp.reqs.txt
RUN python -m pip install --no-cache-dir -r http.reqs.txt
COPY ./Make_Payment.py ./amqp_setup.py ./invokes.py ./
CMD [ "python", "./Make_Payment.py" ]
