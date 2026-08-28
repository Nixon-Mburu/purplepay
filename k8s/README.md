# PurplePay Kubernetes

This folder shows how the Docker Compose setup maps to Kubernetes.

## What Each File Does

- `namespace.yaml` creates an isolated `purplepay` namespace.
- `frontend-apps.yaml` runs each micro-frontend as its own Deployment and Service.
- `frontend-gateway.yaml` runs Nginx and routes `/`, `/auth/`, `/orders/`, `/pay/`, `/wallet/`, `/activity/`, and `/api/`.
- `backend-config.yaml` stores internal backend service URLs for the API gateway and payments module.
- `backend-services.yaml` runs each backend microservice with its own Service and SQLite PersistentVolumeClaim.
- `ingress.yaml` exposes one public host, `purplepay.local`, and sends all traffic to the frontend gateway.

## Build Images Locally

For a local cluster such as Docker Desktop, Minikube, or Kind, build these images:

```bash
docker build -t purplepay/shell-app:latest frontend/apps/shell_app
docker build -t purplepay/auth-app:latest frontend/apps/auth_app
docker build -t purplepay/orders-app:latest frontend/apps/orders_app
docker build -t purplepay/payments-app:latest frontend/apps/payments_app
docker build -t purplepay/wallet-app:latest frontend/apps/wallet_app
docker build -t purplepay/activity-app:latest frontend/apps/activity_app

docker build -t purplepay/api-gateway:latest backend/services/api_gateway
docker build -t purplepay/auth-service:latest backend/services/auth_service
docker build -t purplepay/orders-service:latest backend/services/orders_service
docker build -t purplepay/payments-module:latest backend/services/payments_module
docker build -t purplepay/wallet-service:latest backend/services/wallet_service
docker build -t purplepay/webhook-service:latest backend/services/webhook_service
docker build -t purplepay/admin-service:latest backend/services/admin_service
```

## Apply Kubernetes Files

Apply everything in one command:

```bash
kubectl apply -k k8s
```

Or apply the files one by one:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-config.yaml
kubectl apply -f k8s/backend-services.yaml
kubectl apply -f k8s/frontend-apps.yaml
kubectl apply -f k8s/frontend-gateway.yaml
kubectl apply -f k8s/ingress.yaml
```

## Check Everything

```bash
kubectl get pods -n purplepay
kubectl get services -n purplepay
kubectl get ingress -n purplepay
```

## Local Access

If your local cluster has an Ingress controller, point `purplepay.local` to your cluster address.

For a quick local test without Ingress, port-forward the frontend gateway:

```bash
kubectl port-forward -n purplepay service/frontend-gateway 3000:80
```

Then open:

```txt
http://localhost:3000
http://localhost:3000/auth/
http://localhost:3000/orders/
http://localhost:3000/pay/
http://localhost:3000/wallet/
http://localhost:3000/activity/
```
