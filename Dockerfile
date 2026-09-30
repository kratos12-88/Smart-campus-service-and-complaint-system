FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --no-save express@4 mongodb@6
COPY server.js ./
COPY public ./public
ENV NODE_ENV=production
EXPOSE 10000
CMD ["node","server.js"]
