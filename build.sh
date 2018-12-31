#!/bin/bash

BUILD_MACHINE=$1
IMAGE_TAG="aida-server"
DOCKERFILE="Dockerfile"

# Init empty cache file
if [ ! -f .yarn-cache.tgz ]; then
  echo "Init empty .yarn-cache.tgz"
  tar cvzf .yarn-cache.tgz --files-from /dev/null
fi

if [ "$BUILD_MACHINE" == 'rpi' ]; then
    IMAGE_TAG="$IMAGE_TAG-rpi"
    DOCKERFILE="Rpi.Dockerfile"
    echo "Rpi detected. Tag name - $IMAGE_TAG and Dockerfile - $DOCKERFILE"
fi

docker build -t nickdex/$IMAGE_TAG -f $DOCKERFILE .

docker run --rm --entrypoint cat nickdex/$IMAGE_TAG:latest /yarn.lock > /tmp/yarn.lock
if ! diff -q yarn.lock /tmp/yarn.lock > /dev/null  2>&1; then
  echo "Saving Yarn cache"
  docker run --rm --entrypoint tar nickdex/$IMAGE_TAG:latest czf - /usr/local/share/.cache/yarn/v3/ > .yarn-cache.tgz
  echo "Saving yarn.lock"
  cp /tmp/yarn.lock yarn.lock
fi
