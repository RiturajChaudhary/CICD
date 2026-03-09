pipeline {
    agent any
    environment {
        IMAGE_NAME = "nodejs-jenkins-demo"
        IMAGE_TAG  = "latest"
        DOCKER_CREDENTIALS = 'dockerhub-creds' // Optional: only needed if pushing to Docker Hub
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out code from GitHub..."
                git branch: 'main', url: 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image..."
                sh "docker build -t $IMAGE_NAME:$IMAGE_TAG ."
            }
        }

        stage('Docker Login & Push') {
            when {
                expression { return env.DOCKER_CREDENTIALS != null && env.DOCKER_CREDENTIALS != "" }
            }
            steps {
                echo "Logging into Docker Hub and pushing image..."
                withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS,
                    usernameVariable: 'USERNAME',
                    passwordVariable: 'PASSWORD')]) {
                        sh "echo \$PASSWORD | docker login -u \$USERNAME --password-stdin"
                        sh "docker tag $IMAGE_NAME:$IMAGE_TAG \$USERNAME/$IMAGE_NAME:$IMAGE_TAG"
                        sh "docker push \$USERNAME/$IMAGE_NAME:$IMAGE_TAG"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "Deploying to Minikube..."
                sh "kubectl apply -f k8s/deployment.yaml"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed: Node.js app deployed successfully in Minikube."
        }
        failure {
            echo "❌ Pipeline failed. Check Jenkins logs for details."
        }
    }
}