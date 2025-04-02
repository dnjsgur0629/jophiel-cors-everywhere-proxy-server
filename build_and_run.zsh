PROFILE="dnjsgur0629"
AWS_REGION="ap-northeast-2"

DANGLING_IMAGES=$(aws ecr list-images \
  --repository-name dunamiscapital/ratatoskr \
  --filter "tagStatus=UNTAGGED" \
  --query 'imageIds[*]' \
  --output json --profile "$PROFILE" --region "$AWS_REGION")

  echo "DANGLING_IMAGES: ${DANGLING_IMAGES}"

  if [ "$DANGLING_IMAGES" != "[]" ]; then
    aws ecr batch-delete-image \
      --repository-name dunamiscapital/ratatoskr \
      --image-ids "$DANGLING_IMAGES" \
      --profile "$PROFILE" --region "$AWS_REGION" || { echo "dangling 이미지 삭제 실패"; exit 1; }
  fi
