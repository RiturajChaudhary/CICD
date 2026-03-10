pipeline {
    agent {
        kubernetes {
            label 'docker-agent'
            defaultContainer 'docker'
        }
    }

    environment {
        IMAGE_NAME = "nodejs-jenkins-demo"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS = 'dockerhub-creds'
        KUBE_CONFIG = 'kubeconfig-file'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }

        stage('Build & Push') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS}", 
                        usernameVariable: 'DOCKER_USER', 
                        passwordVariable: 'DOCKER_PASS')]) {
                        sh '''
                           docker build -t $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG .
                           echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                           docker push $DOCKER_USER/$IMAGE_NAME:$IMAGE_TAG
                           docker logout
                        '''
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
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