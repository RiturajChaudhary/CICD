pipeline {
    agent any
    environment {
        IMAGE_NAME = "nodejs-jenkins-demo"
        IMAGE_TAG = "latest"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/<your-username>/nodejs-jenkins-demo.git'
            }
        }
        stage('Build Docker Image') {
            steps {
                sh "docker build -t $IMAGE_NAME:$IMAGE_TAG ."
            }
        }
        stage('Docker Login & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USERNAME',
                    passwordVariable: 'PASSWORD')]) {
                        sh "docker login -u $USERNAME -p $PASSWORD"
                        sh "docker tag $IMAGE_NAME:$IMAGE_TAG $USERNAME/$IMAGE_NAME:$IMAGE_TAG"
                        sh "docker push $USERNAME/$IMAGE_NAME:$IMAGE_TAG"
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                sh "kubectl apply -f k8s/deployment.yaml"
            }
        }
    }
    post {
        success {
            echo "✅ Pipeline completed: Node.js app deployed in Minikube."
        }
        failure {
            echo "❌ Pipeline failed. Check Jenkins logs."
        }
    }
}