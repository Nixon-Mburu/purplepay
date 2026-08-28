# PurplePay Distribution Guide

PurplePay is a learning project for building a distributed payments product with:

- micro-frontends for customer-facing screens
- backend microservices for business logic
- an API gateway for routing browser traffic
- Docker for packaging each app/service
- Kubernetes for running and scaling containers

## Architecture

The browser opens one public frontend address.

```txt
Browser
  |
  |-- http://localhost:3000/          shell_app
  |-- http://localhost:3000/auth/     auth_app
  |-- http://localhost:3000/orders/   orders_app
  |-- http://localhost:3000/pay/      payments_app
  |-- http://localhost:3000/wallet/   wallet_app
  |-- http://localhost:3000/activity/ activity_app
```

Each frontend app calls the API gateway:

```txt
frontend app
  |
        |-- /api/...
        |
        |-- auth_service
        |-- orders_service
        |-- payments_module
        |-- wallet_service
        |-- webhook_service
        |-- admin_service
```

The user sees one domain and one port. Behind that single address, the frontend gateway routes each path to the correct micro-frontend container.

## Frontend Apps

Each app lives in `frontend/apps`.

```txt
frontend/apps
  shell_app       home/navigation app
  auth_app        sign in and register
  orders_app      create payment requests
  payments_app    complete payments
  wallet_app      show balance and ledger
  activity_app    show confirmations and updates
```

Public paths:

```txt
/          shell_app
/auth/     auth_app
/orders/   orders_app
/pay/      payments_app
/wallet/   wallet_app
/activity/ activity_app
```

During local development, each frontend app still runs on its own internal dev port. The shell app proxies the public paths.

```bash
cd frontend/apps/auth_app
npm run dev

cd frontend/apps/orders_app
npm run dev

cd frontend/apps/payments_app
npm run dev

cd frontend/apps/wallet_app
npm run dev

cd frontend/apps/activity_app
npm run dev

cd frontend/apps/shell_app
npm run dev
```

Then open:

```txt
http://localhost:3000
```

The user should navigate by path, not by separate public ports.

## Backend Services

Each backend service lives in `backend/services`.

```txt
backend/services
  api_gateway       public backend entry point
  auth_service      users and sessions
  orders_service    payment requests
  payments_module   payment execution
  wallet_service    balance and ledger
  webhook_service   payment/activity events
  admin_service     audit/admin actions
```

Local ports:

```txt
api_gateway      5000
auth_service     5001
orders_service   5002
wallet_service   5003
payments_module  5004
webhook_service  5005
admin_service    5006
```

Start one backend service:

```bash
cd backend/services/auth_service
../../pay/bin/python app.py
```

## Request Flow

### Sign In

```txt
auth_app
  |
  |-- POST /api/auth/login
        |
        |-- api_gateway
              |
              |-- POST /login
                    |
                    |-- auth_service
                          |
                          |-- SQLite users/sessions tables
```

The auth app does not call `auth_service` directly. It calls the gateway. The gateway forwards the request to `auth_service`.

### Create Order

```txt
orders_app
  |
  |-- POST /api/orders
        |
        |-- api_gateway
              |
              |-- POST /orders
                    |
                    |-- orders_service
                          |
                          |-- SQLite orders table
```

### Complete Payment

```txt
payments_app
  |
  |-- POST /api/payments
        |
        |-- api_gateway
              |
              |-- POST /payments
                    |
                    |-- payments_module
                          |
                          |-- SQLite payments table
                          |-- wallet_service updates ledger
                          |-- webhook_service records activity
```

Payments are more interesting because one backend service talks to other backend services.

## Docker

Docker packages each app or service into an image.

An image is the recipe:

```txt
code + runtime + dependencies + start command
```

A container is a running copy of that image.

This project has containers for:

```txt
Frontend containers:
  shell_app
  auth_app
  orders_app
  payments_app
  wallet_app
  activity_app

Backend containers:
  api_gateway
  auth_service
  orders_service
  payments_module
  wallet_service
  webhook_service
  admin_service

Data volumes:
  auth_data
  orders_data
  payments_data
  wallet_data
  webhook_data
  admin_data
  api_gateway_data
```

Run everything with Docker Compose:

```bash
docker compose up --build
```

Then open the only public frontend port:

```txt
http://localhost:3000
```

Inside Docker, the `frontend_gateway` container sends traffic to the right internal container:

```txt
/          -> shell_app:3000
/auth/     -> auth_app:3001
/orders/   -> orders_app:3002
/pay/      -> payments_app:3003
/wallet/   -> wallet_app:3004
/activity/ -> activity_app:3005
/api/      -> api_gateway:5000
```

Backend services talk using container names:

```txt
api_gateway -> http://auth_service:5001
api_gateway -> http://orders_service:5002
payments_module -> http://wallet_service:5003
payments_module -> http://webhook_service:5005
```

From the browser, users only use `localhost:3000`.

## Kubernetes

Kubernetes runs the same containers, but with stronger orchestration.

In Kubernetes we create:

- a Deployment for each frontend app
- a Deployment for each backend service
- a Service for each Deployment
- ConfigMaps/Secrets for environment variables
- PersistentVolumes for SQLite learning data
- optionally an Ingress for public routing

Example Kubernetes shape:

```txt
Ingress or frontend gateway
  |
  |-- /          shell_app
  |-- /auth/     auth_app
  |-- /orders/   orders_app
  |-- /pay/      payments_app
  |-- /wallet/   wallet_app
  |-- /activity/ activity_app
  |-- /api/      api_gateway

api_gateway
  |
  |-- auth_service
  |-- orders_service
  |-- payments_module
  |-- wallet_service
  |-- webhook_service
  |-- admin_service
```

With Kubernetes, users could eventually visit one domain:

```txt
purplepay.local/auth/
purplepay.local/orders/
purplepay.local/pay/
```

while Kubernetes routes each path to the correct frontend container.

## Recommended Build Order

1. Make each frontend app work locally.
2. Make each backend service work locally.
3. Make the API gateway route to all services.
4. Add Dockerfiles for every app and service.
5. Run everything with Docker Compose.
6. Convert the Compose setup into Kubernetes manifests.
7. Add Ingress so all apps can be reached from one host and path structure.

## Mental Model

The shell app is the customer entrance.

The micro-frontends are the customer rooms.

The API gateway is the front desk for backend requests.

The backend microservices are the departments doing the actual work.

Docker packages every room and department into containers.

Kubernetes decides where those containers run, how many copies exist, and how they find each other.
