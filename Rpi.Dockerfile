FROM arm32v7/node

COPY ./qemu-arm-static /usr/bin/qemu-arm-static

WORKDIR /app

# Copy cache contents (if any) from local machine
ADD .yarn-cache.tgz package.json yarn.lock /

# Install packages
# Container Specific node packages at root (for remote debug)
RUN cd / && yarn && ln -s /node_modules /app/node_modules

ADD . /app

EXPOSE 3000

CMD [ "yarn", "start" ]
