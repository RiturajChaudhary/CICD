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
        NAMESPACE       = 'jenkins'
        DEPLOYMENT_NAME = 'nodejs-deployment'
        CONTAINER_NAME  = 'nodejs'
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

                            if kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE > /dev/null 2>&1; then
                                echo "✅ Deployment exists — updating image to $IMAGE"
                                kubectl set image deployment/$DEPLOYMENT_NAME \
                                    $CONTAINER_NAME=$IMAGE \
                                    -n $NAMESPACE
                            else
                                echo "🚀 First run — creating deployment with image $IMAGE"
                                sed "s|riturajchaudhary/cicd:latest|$IMAGE|g" k8s/deployment.yaml \
                                    | kubectl apply -f - -n $NAMESPACE
                            fi

                            if kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=120s; then
                                echo "✅ Rollout successful — Build $IMAGE_TAG is live"
                            else
                                echo "❌ Rollout failed — rolling back to previous version"
                                kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE
                                exit 1
                            fi
                        '''
                    }
                }
            }
        }
    }
}
