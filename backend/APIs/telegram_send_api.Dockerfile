FROM python:3-slim
WORKDIR /usr/src/app
COPY http.reqs.txt ./
RUN python -m pip install --no-cache-dir -r http.reqs.txt
COPY ./APIs/telegram_send_api.py ./
COPY ./APIs/s3ndm3@n0tif1cationf0rt3l3gr@m.session ./
CMD [ "python", "./telegram_send_api.py" ]