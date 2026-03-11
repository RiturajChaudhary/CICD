
pipeline {
    agent any   // Runs on any available Jenkins agent

    environment {
        IMAGE_NAME = "rituraj4164/buildah-demo"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_CREDS = "dockerhub-creds"
    }

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build Image') {
            steps {
                sh "buildah bud -t $IMAGE_NAME:$IMAGE_TAG ."
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: DOCKER_CREDS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "buildah login -u $DOCKER_USER -p $DOCKER_PASS docker.io"
                    sh "buildah push $IMAGE_NAME:$IMAGE_TAG"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    # Replace image in deployment YAML
                    sed -i 's|rituraj4164/buildah-demo:latest|$IMAGE_NAME:$IMAGE_TAG|' k8s/deployment.yaml

                    # Apply deployment
                    kubectl apply -f k8s/deployment.yaml -n jenkins

                    # Update image explicitly for rollout
                    kubectl set image deployment/buildah-app buildah-app=$IMAGE_NAME:$IMAGE_TAG -n jenkins
                    kubectl rollout status deployment/buildah-app -n jenkins
                """
            }
        }

    }

    post {
        always {
            echo "CI/CD pipeline finished for build ${BUILD_NUMBER}"
        }
    }
}
