PROFILE="dnjsgur0629"
AWS_ACCOUNT_ID="723373476465"
AWS_REGION="ap-northeast-2"
NODE_ENV=${NODE_ENV:-development}

if [ "$NODE_ENV" = "production" ]; then
  IMAGE_TAG="$(date +%Y%m%d)A"
  PORT=17000
else
  IMAGE_TAG="sandbox"
  PORT=18000
fi

REPO_NAME="dunamiscapital/proxy"
IMAGE="${REPO_NAME}:${IMAGE_TAG}"
ECR_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE}"

echo "ENV: $NODE_ENV"

echo "Docker 이미지를 빌드합니다..."
docker build --build-arg NODE_ENV="${NODE_ENV}" --build-arg PORT="${PORT}" -t ${IMAGE} . || { echo "빌드 실패"; exit 1; }

echo "이미지 태깅: ${IMAGE} -> ${ECR_IMAGE}"
docker tag ${IMAGE} ${ECR_IMAGE} || { echo "태깅 실패"; exit 1; }

echo "AWS ECR에 로그인 중..."
aws ecr get-login-password --profile "$PROFILE" --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com" || { echo "로그인 실패"; exit 1; }

echo "이미지를 ECR에 푸시합니다..."
docker push ${ECR_IMAGE} || { echo "푸시 실패"; exit 1; }

echo "ECR에 이미지가 성공적으로 푸시되었습니다."
echo "로컬 태그 ${ECR_IMAGE} 제거 중..."
docker rmi ${ECR_IMAGE} || { echo "로컬 태그 제거 실패"; exit 1; }

#DANGLING_IMAGES 삭제
echo "dangling image를 삭제합니다."
DANGLING_IMAGES=$(aws ecr list-images \
  --repository-name $REPO_NAME \
  --filter "tagStatus=UNTAGGED" \
  --query 'imageIds[*]' \
  --output json --profile "$PROFILE" --region "$AWS_REGION")

  if [ "$DANGLING_IMAGES" != "[]" ]; then
    aws ecr batch-delete-image \
      --repository-name $REPO_NAME \
      --image-ids "$DANGLING_IMAGES" \
      --profile "$PROFILE" --region "$AWS_REGION" || { echo "dangling 이미지 삭제 실패"; exit 1; }
  fi

echo "완료되었습니다. 이미지가 ECR에 성공적으로 업로드되었습니다."


