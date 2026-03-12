# 🚀 Deploying a Node.js Application to Kubernetes Using Jenkins CI/CD and Minikube

A complete guide to setting up a local CI/CD pipeline that automatically builds, pushes, and deploys a Node.js application to a Kubernetes cluster using Jenkins (via Helm), Minikube, Docker Desktop, and Cloudflare Tunnel for webhook integration.

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Docker Desktop | Container runtime |
| Minikube | Local Kubernetes cluster |
| Buildah | Build & push container images (daemonless) |
| Kubernetes (kubectl) | Container orchestration |
| Jenkins (Helm) | CI/CD automation |
| Cloudflare Tunnel | Expose localhost for webhooks |
| Node.js | Application runtime |
| Docker Hub | Container image registry |

---

## 📋 Prerequisites

- Docker Desktop installed and running
- `kubectl` installed
- `helm` installed
- `minikube` installed
- `buildah` installed
- `cloudflared` installed
- A Docker Hub account
- A GitHub repository with your Node.js app

---

## 1️⃣ Docker Desktop

```bash
# Verify Docker is running
docker version
docker info
```

---

## 2️⃣ Minikube Setup

```bash
# Start Minikube with 4 CPUs and 8GB RAM
minikube start --cpus=4 --memory=8192

# Verify cluster status
minikube status
```

**Expected output:**
```
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

### Useful Minikube Commands

```bash
# Get Minikube IP
minikube ip

# Stop the cluster
minikube stop

# Delete and reset cluster
minikube delete
```

---

## 3️⃣ Jenkins Installation via Helm

```bash
# Add Jenkins Helm repo
helm repo add jenkins https://charts.jenkins.io
helm repo update

# Create namespace
kubectl create namespace jenkins

# Install Jenkins
helm install jenkins jenkins/jenkins --namespace jenkins

# Watch pod startup
kubectl get pods -n jenkins -w
```

### Get Admin Password

```bash
kubectl exec -n jenkins -it svc/jenkins -c jenkins -- sh -c "cat /run/secrets/additional/chart-admin-password"
```

### Check Jenkins Service

```bash
kubectl get svc --namespace jenkins
kubectl describe svc jenkins --namespace jenkins
```

### Port Forward Jenkins UI

```bash
kubectl port-forward svc/jenkins 8080:8080 --namespace jenkins
```

> Jenkins is now accessible at **http://localhost:8080**
> Login: `admin` / `<password from above>`

---

## 4️⃣ CI/CD Pipeline Configuration

### 4.1 Jenkins Credentials

Go to **Manage Jenkins → Credentials → Global → Add Credentials**

| Credential ID | Kind | Description |
|---------------|------|-------------|
| `docker-hub-credentials` | Username/Password | Docker Hub username + password/token |
| `github-token` | Secret Text | GitHub Personal Access Token |

---

### 4.2 Cloudflare Tunnel (for Webhook)

Since Jenkins runs locally, Cloudflare Tunnel exposes it publicly so GitHub can send webhooks.

```bash
# Quick tunnel (no account needed)
cloudflared tunnel --url http://localhost:8080
```

Copy the generated URL, e.g.:
```
https://random-name.trycloudflare.com
```

> ⚠️ Quick tunnel URLs change on every restart. For a persistent URL, use a named tunnel with a Cloudflare account.

#### Named Tunnel (Persistent)

```bash
cloudflared tunnel login
cloudflared tunnel create jenkins-tunnel
cloudflared tunnel route dns jenkins-tunnel jenkins.yourdomain.com
cloudflared tunnel run jenkins-tunnel
```

---

### 4.3 GitHub Webhook Setup

Go to your GitHub repo → **Settings → Webhooks → Add webhook**

| Field | Value |
|-------|-------|
| Payload URL | `https://<tunnel-url>/github-webhook/` |
| Content type | `application/json` |
| Events | Push Request |
| Active | ✅ |

> ⚠️ The trailing slash in `/github-webhook/` is required.

---

### 4.4 Jenkins Job Configuration

```
New Item → Pipeline → OK
Build Triggers → ✅ GitHub hook trigger for GITScm polling
Pipeline → Pipeline script from SCM
SCM: Git
Repository URL: https://github.com/<user>/<repo>.git
Credentials: github-token
Branch: */main
Script Path: Jenkinsfile
```

---

### 4.5 Access the App

```bash
# Port-forward the service
kubectl port-forward svc/nodejs-app-service 3000:80
```

Once running, open the app at: [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
CICD/
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
├── Dockerfile
├── index.js
├── Jenkinsfile
├── package.json
└── README.md
```

---

## 🔄 Pipeline Flow

```
GitHub Push
    ↓
GitHub Webhook (via Cloudflare Tunnel)
    ↓
Jenkins Triggered
    ↓
Checkout → Install → Test → Build Image → Push to Docker Hub
    ↓
kubectl set image (rolling update)
    ↓
App Live on Kubernetes (Minikube)
```

---

*Node.js CI/CD Pipeline with Jenkins, Minikube & Cloudflare Tunnel*
