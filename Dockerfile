# Node.js의 경량 버전을 기반 이미지로 사용 (예: 22 버전의 Alpine)
FROM node:22-alpine

ARG NODE_ENV=developmet
ARG EXPOSE_PORT=18000

ENV NODE_ENV=$NODE_ENV
# 애플리케이션 디렉터리 생성 및 작업 디렉터리 설정
WORKDIR /usr/src/app

# package.json 및 package-lock.json (또는 yarn.lock)이 있다면 먼저 복사하여 의존성 설치 속도를 높입니다.
COPY package*.json ./

# 프로덕션 환경에서 필요한 의존성만 설치 (개발 의존성은 제외)
RUN npm install --production

# 애플리케이션 소스 전체를 컨테이너에 복사
COPY . .

EXPOSE ${EXPOSE_PORT}

STOPSIGNAL SIGINT
CMD [ "node", "server.js" ]
