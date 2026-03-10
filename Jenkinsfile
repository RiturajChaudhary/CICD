pipeline {
    agent any

    environment {
        IMAGE_NAME = "nodejs-jenkins-demo"
        // Use build number as dynamic tag
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS = 'dockerhub-creds'
        KUBE_CONFIG = 'kubeconfig-file'
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo "🔹 Checking out code from GitHub..."
                git branch: 'main',
                    url: 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🔹 Building Docker image with tag ${IMAGE_TAG}..."
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
                        sh "docker logout"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo "🔹 Deploying Node.js app to Kubernetes..."
                withCredentials([file(credentialsId: KUBE_CONFIG, variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG
                        kubectl config current-context
                        kubectl get nodes
                        # Update deployment image dynamically
                        kubectl set image deployment/static-web-deployment nodejs-app=$DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG
                        kubectl rollout status deployment/static-web-deployment
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully: Node.js app deployed to Kubernetes with tag ${IMAGE_TAG}."
        }
        failure {
            echo "❌ Pipeline failed. Check Jenkins logs for details."
        }
    }
}