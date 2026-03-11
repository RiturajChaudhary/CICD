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
            '''
        }
    }
    environment {
        IMAGE_NAME      = "docker.io/${env.DOCKER_USERNAME}/${env.JOB_NAME.toLowerCase()}"
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        DOCKER_CREDS    = 'docker-credentials-id'
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
                    sh 'buildah bud -t $IMAGE_NAME:$IMAGE_TAG .'
                }
            }
        }
        stage('Push Image') {
            steps {
                container('buildah') {
                    withCredentials([usernamePassword(credentialsId: "$DOCKER_CREDS", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh 'buildah login -u $USER -p $PASS docker.io'
                        sh 'buildah push $IMAGE_NAME:$IMAGE_TAG'
                    }
                }
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        if kubectl get deployment $DEPLOYMENT_NAME > /dev/null 2>&1; then
                            kubectl set image deployment/$DEPLOYMENT_NAME $CONTAINER_NAME=$IMAGE_NAME:$IMAGE_TAG
                        else
                            kubectl apply -f k8s/deployment.yaml
                        fi
                    '''
                }
            }
        }
    }
}
