pipeline {
    agent any

    environment {
        IMAGE_NAME = "nodejs-jenkins-demo"
        IMAGE_TAG  = "latest"
        DOCKER_CREDENTIALS = 'dockerhub-creds'  // Optional: Jenkins credential ID for Docker Hub
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo "🔹 Checking out code from public GitHub repository..."
                git branch: 'main',
                    url: 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🔹 Building Docker image..."
                sh "docker build -t $IMAGE_NAME:$IMAGE_TAG ."
            }
        }

        stage('Docker Login & Push') {
            when {
                expression { return env.DOCKER_CREDENTIALS != null && env.DOCKER_CREDENTIALS != "" }
            }
            steps {
                echo "🔹 Logging into Docker Hub and pushing image..."
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"
                        sh "docker tag $IMAGE_NAME:$IMAGE_TAG \$DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG"
                        sh "docker push \$DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "🔹 Deploying Node.js app to Minikube..."
                sh "kubectl apply -f k8s/deployment.yaml"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully: Node.js app deployed in Minikube."
        }
        failure {
            echo "❌ Pipeline failed. Check Jenkins logs for details."
        }
    }
}