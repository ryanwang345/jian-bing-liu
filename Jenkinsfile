pipeline {
  agent {
    kubernetes {
      cloud 'local-k8s'
      defaultContainer 'node'
      yaml '''
apiVersion: v1
kind: Pod
spec:
  shareProcessNamespace: false
  securityContext:
    fsGroup: 1000
  containers:
    - name: node
      image: node:22-bookworm
      command: ['cat']
      tty: true
      resources:
        requests:
          memory: 512Mi
          cpu: 200m
        limits:
          memory: 2Gi

    - name: buildkit
      image: moby/buildkit:v0.34.2-rootless
      command: ['cat']
      tty: true
      env:
        # Each invocation starts a temporary daemon inside this container.
        # Native snapshots avoid requiring /dev/fuse or overlayfs support.
        - name: BUILDKITD_FLAGS
          value: --oci-worker-no-process-sandbox --oci-worker-snapshotter=native
      resources:
        requests:
          memory: 512Mi
          cpu: 200m
        limits:
          memory: 3Gi
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        runAsGroup: 1000
        # Required by rootless BuildKit's user namespaces and mounts.
        seccompProfile:
          type: Unconfined
        appArmorProfile:
          type: Unconfined
      volumeMounts:
        - name: buildkit-state
          mountPath: /home/user/.local/share/buildkit
  volumes:
    - name: buildkit-state
      emptyDir: {}
'''
    }
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '15'))
    disableConcurrentBuilds(abortPrevious: true)
  }

  parameters {
    booleanParam(
      name: 'PUSH_IMAGE',
      defaultValue: true,
      description: 'Build and push Docker image to Docker Hub on main branch using rootless BuildKit'
    )
    string(
      name: 'NEXT_PUBLIC_SITE_URL',
      defaultValue: 'https://jianbingliu.uk',
      description: 'Public canonical site URL baked into metadata and structured data'
    )
    choice(
      name: 'AUTO_DEPLOY_ENV',
      choices: ['staging', 'prod', 'none'],
      description: 'Automatically trigger JianBingLiu-Deploy after pushing an image on main'
    )
  }

  environment {
    IMAGE_REPO = 'jian-bing-liu'
    NEXT_TELEMETRY_DISABLED = '1'
    SITE_URL = "${params.NEXT_PUBLIC_SITE_URL ?: 'https://jianbingliu.uk'}"
  }

  stages {
    stage('Install Dependencies') {
      steps {
        container('node') {
          sh '''
            set -eu
            corepack enable
            corepack prepare pnpm@11.0.9 --activate
            pnpm install --frozen-lockfile
          '''
        }
      }
    }

    stage('Validate') {
      steps {
        container('node') {
          sh '''
            set -eu
            corepack enable
            corepack prepare pnpm@11.0.9 --activate
            pnpm typecheck
            pnpm lint
            NEXT_PUBLIC_SITE_URL="${SITE_URL:-https://jianbingliu.uk}" pnpm build
          '''
        }
      }
    }

    stage('Build & Push Image') {
      when {
        expression {
          def branch = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: '').replaceFirst('^origin/', '')
          def isMain = (branch == 'main' || branch == '')
          return isMain && params.PUSH_IMAGE != false
        }
      }
      steps {
        withCredentials([
          string(
            credentialsId: 'DOCKERHUB_USER',
            variable: 'DOCKERHUB_USER'
          ),
          string(
            credentialsId: 'DOCKERHUB_TOKEN',
            variable: 'DOCKERHUB_TOKEN'
          )
        ]) {
          container('buildkit') {
            sh '''
              set +x
              set -eu

              umask 077
              DOCKER_CONFIG=$(mktemp -d /tmp/jianbingliu-docker.XXXXXX)
              export DOCKER_CONFIG
              trap 'rm -rf "$DOCKER_CONFIG"' EXIT

              AUTH=$(printf '%s:%s' \
                "$DOCKERHUB_USER" "$DOCKERHUB_TOKEN" \
                | base64 | tr -d '[:space:]')

              printf '{"auths":{"https://index.docker.io/v1/":{"auth":"%s"}}}' \
                "$AUTH" > "$DOCKER_CONFIG/config.json"

              unset AUTH

              IMAGE="docker.io/${DOCKERHUB_USER}/${IMAGE_REPO}"
              IMAGE_TAGS="${IMAGE}:${BUILD_NUMBER},${IMAGE}:latest"
              OUTPUT=$(printf 'type=image,"name=%s",push=true' "$IMAGE_TAGS")

              set -- build \
                --progress=plain \
                --frontend=dockerfile.v0 \
                --local "context=${WORKSPACE}" \
                --local "dockerfile=${WORKSPACE}" \
                --opt "build-arg:NEXT_PUBLIC_SITE_URL=${SITE_URL:-https://jianbingliu.uk}" \
                --output "$OUTPUT"

              if [ -s "${WORKSPACE}/extra-ca.crt" ]; then
                set -- "$@" --secret "id=extra-ca,src=${WORKSPACE}/extra-ca.crt"
              fi

              echo "[BuildKit] Building and pushing ${IMAGE}:${BUILD_NUMBER}..."
              buildctl-daemonless.sh "$@"

              echo "=========================================================="
              echo "[CI] Published ${IMAGE}:${BUILD_NUMBER} and ${IMAGE}:latest"
              echo "=========================================================="
            '''
          }
        }
      }
    }

    stage('Trigger Deployment') {
      when {
        expression {
          def branch = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: '').replaceFirst('^origin/', '')
          def isMain = (branch == 'main' || branch == '')
          def targetEnv = params.AUTO_DEPLOY_ENV ?: 'staging'
          return isMain && params.PUSH_IMAGE != false && targetEnv != 'none'
        }
      }
      steps {
        script {
          def targetEnv = params.AUTO_DEPLOY_ENV ?: 'staging'
          echo "=========================================================="
          echo "[CI] Automatically triggering JianBingLiu-Deploy..."
          echo "[CI] Target Env: ${targetEnv}"
          echo "[CI] Image Tag:  ${env.BUILD_NUMBER}"
          echo "=========================================================="

          build job: 'JianBingLiu-Deploy', wait: false, parameters: [
            string(name: 'IMAGE_TAG', value: "${env.BUILD_NUMBER}"),
            string(name: 'TARGET_ENV', value: targetEnv)
          ]
        }
      }
    }
  }
}
