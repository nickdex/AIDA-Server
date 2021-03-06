FROM node

WORKDIR /app

# Copy cache contents (if any) from local machine
ADD .yarn-cache.tgz package.json yarn.lock /

# Install packages
# Container Specific node packages at root (for remote debug)
RUN cd / && yarn && ln -s /node_modules /app/node_modules

ADD . /app

EXPOSE 80

CMD [ "yarn", "start" ]
