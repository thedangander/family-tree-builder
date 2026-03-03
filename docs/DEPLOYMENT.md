# Deployment Guide

## Overview

This guide covers deploying the Family Tree Service to various environments.

## Deployment Options

1. **Docker Compose** - Local/development deployment
2. **Kubernetes with Helm** - Production deployment
3. **Cloud Services** - Managed cloud deployment

---

## Docker Compose Deployment

### Local Development

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Production with Docker Compose

Create a production override file:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - MongoDB__ConnectionString=mongodb://mongodb:27017
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G

  frontend:
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  mongodb:
    volumes:
      - mongodb_data:/data/db
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

volumes:
  mongodb_data:
    driver: local
```

Deploy:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Kubernetes Deployment with Helm

### Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Helm 3.x installed

### Cluster Setup

```bash
# Verify cluster connection
kubectl cluster-info

# Create namespace
kubectl create namespace family-tree
```

### Install with Helm

```bash
# Navigate to charts directory
cd charts/family-tree

# Install the chart
helm install family-tree . \
  --namespace family-tree \
  --create-namespace

# Or with custom values
helm install family-tree . \
  --namespace family-tree \
  --values values-prod.yaml
```

### Custom Values

Create `values-prod.yaml`:

```yaml
# Production values
api:
  replicaCount: 3
  image:
    repository: your-registry.com/family-tree-api
    tag: "1.0.0"
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi

frontend:
  replicaCount: 2
  image:
    repository: your-registry.com/family-tree-frontend
    tag: "1.0.0"
  graphqlEndpoint: "https://api.yourdomain.com/graphql"
  resources:
    limits:
      cpu: 200m
      memory: 128Mi
    requests:
      cpu: 100m
      memory: 64Mi

mongodb:
  enabled: true
  persistence:
    size: 20Gi
  auth:
    username: family-tree
    password: your-secure-password

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
    - host: app.yourdomain.com
  tls:
    - secretName: family-tree-tls
      hosts:
        - app.yourdomain.com
```

### Upgrade Deployment

```bash
# Upgrade with new values
helm upgrade family-tree . \
  --namespace family-tree \
  --values values-prod.yaml

# Rollback if needed
helm rollback family-tree 1 --namespace family-tree
```

### Uninstall

```bash
helm uninstall family-tree --namespace family-tree
kubectl delete namespace family-tree
```

---

## Cloud Provider Deployments

### AWS (EKS)

1. **Create EKS Cluster**:
```bash
eksctl create cluster \
  --name family-tree \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3
```

2. **Install AWS Load Balancer Controller**:
```bash
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=family-tree
```

3. **Deploy with Helm** (use AWS-specific values):
```yaml
# values-aws.yaml
ingress:
  enabled: true
  className: alb
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
```

### Azure (AKS)

1. **Create AKS Cluster**:
```bash
az aks create \
  --resource-group family-tree-rg \
  --name family-tree-cluster \
  --node-count 3 \
  --node-vm-size Standard_D2s_v3 \
  --generate-ssh-keys
```

2. **Get Credentials**:
```bash
az aks get-credentials \
  --resource-group family-tree-rg \
  --name family-tree-cluster
```

3. **Deploy with Helm**

### Google Cloud (GKE)

1. **Create GKE Cluster**:
```bash
gcloud container clusters create family-tree \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-medium
```

2. **Get Credentials**:
```bash
gcloud container clusters get-credentials family-tree \
  --zone us-central1-a
```

3. **Deploy with Helm**

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
          dotnet-quality: 'preview'
      
      - name: Restore dependencies
        run: dotnet restore
      
      - name: Build
        run: dotnet build --no-restore
      
      - name: Test
        run: dotnet test --no-build --verbosity normal

  build-api:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push API
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.api
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-api:${{ github.sha }}

  build-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}

  deploy:
    needs: [build-api, build-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
      
      - name: Install Helm
        uses: azure/setup-helm@v3
      
      - name: Deploy to Kubernetes
        run: |
          helm upgrade --install family-tree ./charts/family-tree \
            --namespace family-tree \
            --create-namespace \
            --set api.image.tag=${{ github.sha }} \
            --set frontend.image.tag=${{ github.sha }}
```

---

## Monitoring Setup

### Prometheus + Grafana

```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  --create-namespace

# Install Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set adminPassword=admin
```

### Add API Metrics

Add to API project:

```csharp
// Add Prometheus metrics endpoint
app.UseMetricServer();
app.UseHttpMetrics();
```

---

## Backup Strategy

### MongoDB Backup

```bash
# Create backup CronJob
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mongodb-backup
  namespace: family-tree
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: mongo:8.0
            command:
            - /bin/sh
            - -c
            - mongodump --uri="mongodb://mongodb:27017" --archive=/backup/dump-$(date +%Y%m%d).gz --gzip
            volumeMounts:
            - name: backup
              mountPath: /backup
          volumes:
          - name: backup
            persistentVolumeClaim:
              claimName: mongodb-backup-pvc
          restartPolicy: OnFailure
EOF
```

---

## Troubleshooting

### Common Issues

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n family-tree
kubectl logs <pod-name> -n family-tree
```

**Database connection issues:**
```bash
# Check MongoDB service
kubectl get svc -n family-tree

# Test connectivity
kubectl run -it --rm debug --image=mongo:8.0 -- mongo mongodb://mongodb:27017
```

**Ingress not working:**
```bash
# Check ingress
kubectl get ingress -n family-tree
kubectl describe ingress family-tree -n family-tree

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

### Useful Commands

```bash
# Get all resources
kubectl get all -n family-tree

# Check resource usage
kubectl top pods -n family-tree

# Port forward for debugging
kubectl port-forward svc/family-tree-api 5000:80 -n family-tree

# Execute into pod
kubectl exec -it <pod-name> -n family-tree -- /bin/sh
```
