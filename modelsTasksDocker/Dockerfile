# Base image
FROM ubuntu:20.04

ENV TZ=Europe/Athens
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install python
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get update && apt-get install -y \
    python3.9 \
    python3-distutils \
    python3-pip \
    python3-apt
RUN pip install numpy scipy gensim rbo sparse_dot_topn openai
RUN pip3 install pyldavis pandas==1.5.3

RUN apt install python-is-python3

# Directories architecture
WORKDIR /app
RUN mkdir -p /data/TMmodels

# Application
COPY . .

ARG COMMANDS
ARG INPUT_REDIRECTION

# Execution
CMD ["bash", "-c", "${COMMANDS} < ${INPUT_REDIRECTION}"]
