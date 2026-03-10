pipeline {
    agent {
        kubernetes {
            label 'docker-dind-agent'
            defaultContainer 'jnlp'
            yamlFile 'jenkins-dind-agent.yaml'  // use the YAML you just created
        }
    }

    environment {
        IMAGE_NAME = "nodejs-jenkins-demo"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_USER = "rituraj4164"
        DOCKER_CREDS = "dockerhub-creds"
        KUBE_CONFIG = "kubeconfig-file"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                container('docker') {
                    sh 'docker info'
                    sh 'docker build -t $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG .'
                    sh 'docker images'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDS,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG
                        docker logout
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    withCredentials([file(credentialsId: KUBE_CONFIG, variable: 'KUBECONFIG')]) {
                        sh '''
                        export KUBECONFIG=$KUBECONFIG
                        kubectl set image deployment/static-web-deployment \
                        nodejs-app=$DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG
                        kubectl rollout status deployment/static-web-deployment
                        '''
                    }
                }
            }
        }
    }

    post {
        success { echo "✅ Pipeline completed successfully!" }
        failure { echo "❌ Pipeline failed. Check logs." }
    }
}