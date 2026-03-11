pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                  - name: buildah
                    image: quay.io/buildah/stable:latest
                    command:
                    - sleep
                    args:
                    - 99d
                    securityContext:
                      privileged: true
                  - name: kubectl
                    image: bitnami/kubectl:latest
                    command:
                    - sleep
                    args:
                    - 99d
                    securityContext:
                      runAsUser: 0
            '''
        }
    }
    environment {
        DOCKER_CREDS    = 'dockerhub-creds'
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        DEPLOYMENT_NAME = "${env.JOB_NAME.toLowerCase()}"
        CONTAINER_NAME  = "${env.JOB_NAME.toLowerCase()}"
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/RiturajChaudhary/CICD.git'
            }
        }
        stage('Build Image') {
            steps {
                container('buildah') {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh 'buildah bud -t docker.io/$USER/${JOB_NAME,,}:$IMAGE_TAG .'
                    }
                }
            }
        }
        stage('Push Image') {
            steps {
                container('buildah') {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh 'buildah login -u $USER -p $PASS docker.io'
                        sh 'buildah push docker.io/$USER/${JOB_NAME,,}:$IMAGE_TAG'
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh '''
                            IMAGE=docker.io/$USER/${JOB_NAME,,}:$IMAGE_TAG

                            # Deploy
                            if kubectl get deployment $DEPLOYMENT_NAME > /dev/null 2>&1; then
                                kubectl set image deployment/$DEPLOYMENT_NAME $CONTAINER_NAME=$IMAGE
                            else
                                kubectl apply -f k8s/deployment.yaml
                            fi

                            # Service
                            if kubectl get service $SERVICE_NAME > /dev/null 2>&1; then
                                echo "Service $SERVICE_NAME already exists, skipping..."
                            else
                                kubectl expose deployment $DEPLOYMENT_NAME \
                                    --name=$SERVICE_NAME \
                                    --type=NodePort \
                                    --port=3000 \
                                    --target-port=3000
                            fi
                        '''
                    }
                }
            }
        }
    }
}
