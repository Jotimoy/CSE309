FROM node:18-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --production
COPY frontend/ ./
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
