# ESD-Group6

## set environ variables into a .env file for microservices to use

``` 
TELEGRAM_API_SESSION="********************************"
TELEGRAM_API_ID="***********************"
TELEGRAM_API_HASH="********************************"
SENDGRID_API_KEY="********************************"
STRIPE_SECRET_KEY="********************************"
GOOGLE_API_KEY="************************************"
CATALOG_DB_URL="mongodb+srv://<user>:<pass>@cluster0.cljlebi.mongodb.net/?retryWrites=true&w=majority"
CUSTOMER_DB_URL="mongodb+srv://<user>:<pass>@cluster0.cljlebi.mongodb.net/?retryWrites=true&w=majority"
BOOKING_DB_URL="mongodb+srv://<user>:<pass>@cluster0.cljlebi.mongodb.net/?retryWrites=true&w=majority"
WAITLIST_DB_URL="mongodb+srv://<user>:<pass>@cluster0.cljlebi.mongodb.net/?retryWrites=true&w=majority"  
```

## To host all microservices locally on docker (windows only)
### Windows
Navigate to cmd prompt and run the run-docker.bat file at the root directory <br>
``` run-docker.bat ```
### Linux and Mac
Navigate to terminal and run the run-docker.sh file at the root directory <br>
``` chmod +x run-docker.sh ``` <br>
``` run-docker.sh ```

### start docker compose manually
``` docker-compose --env-file .env convert ``` <br>
``` docker-compose up ```

### Use snapshot to get kong running seamlessly
Navigate to Konga UI and import the snapshot (snapshot_4.json) in <br>
Click on the snapshot and click on the restore button <br>
Restore the services first then restore the routes 

## Use web application build into Docker with Nginx (all API calls are proxied to the backend microservices hosted on GKE)
``` cd /frontend ```<br>
``` docker build -t nickyex2/greentable_web:latest . ```<br>
``` docker run -p 80:80 --name greentable_web nickyex2/greentable_web:latest ```<br>

### src folder
By default the src folder is using kubernetes endpoints to access the backend microservices. <br>
To use local endpoints, unzip the src-localhost.zip and overwrite the default src folder <br>

## Kubernetes Deployment (valid till 28th June 2023)
Backend Microservices are hosted on Google Kubernetes Engine with Kong as the API Gateway

### Kubernetes endpoints
All microservices:  http://34.124.236.222:8000/api/v1/... <br>
RabbitMQ:           http://34.87.124.206:15672/#/

#### Paths
Booking:        /api/v1/booking ==> Resolves as /booking <br>
Customer:       /api/v1/customer ==> Resolves as /customer <br>
Catalog:        /api/v1/catalog ==> Resolves as /catalog <br>
Waitlist:       /api/v1/waitlist ==> Resolves as /waitlist <br>
Make-Payment:   /api/v1/pay ==> Resolves as /make_payment <br>
Place-Booking:  /api/v1/place ==> Resolves as /booking/place_booking <br>
Cancel-Booking: /api/v1/cancel ==> Resolves as /booking/cancel <br>

## Accounts created for testing
### Stripe API credit card numbers
#### Pass
4242 4242 4242 4242 <br>
5555 5555 5555 4444 <br>
3782 822463 10005 <br>

#### Fail
4000 0000 0000 9995 <br>
4000 0000 0000 0002 <br>
4000 0000 0000 0127 <br>
<br>

### Test customer login
username: nicholas <br>
password: test <br>

### Test business login
Username: Business <br>
Password: test <br>

#### on the database side customers have been created
username: nicholas <br>
credit card: set to pass <br><br>

username: chiok <br>
credit card: set to pass <br><br>

username: daryl <br>
credit card: set to pass <br><br>

username: daniel <br>
credit card: set to fail <br><br>

username: colin <br>
credit card: set to fail 

## Postman Collection
The Postman-API-calls.zip contains all the API calls used in the web application (localhost). <br>

## Kompose with Kong
The folder kompose with kong contains the deployment and service files that are used to deploy the backend microservices on GKE. <br>

## Database Attributes and Return Formats
The file attributes.txt contains the database attributes and return formats for microservices. <br>