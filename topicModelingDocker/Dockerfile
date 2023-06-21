# Base image
FROM ubuntu:22.04

# Set noninteractive mode
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && \
apt-get upgrade -y && \
apt-get install -y --no-install-recommends tzdata \
python3.10 \
python3-distutils \
python3-pip \
python3-apt \
build-essential \
gcc \
python3-dev \
python-is-python3

# Clean up the package cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install --upgrade pip setuptools wheel
COPY requirements.txt requirements.txt
RUN python3 -m pip install -r requirements.txt 

ENV TZ=Europe/Athens
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
# Install OpenJDK-8
RUN apt-get update && \
apt-get install -y openjdk-8-jdk && \
apt-get install -y ant && \
apt-get clean;
# Fix certificate issues
RUN apt-get update && \
apt-get install ca-certificates-java && \
apt-get clean && \
update-ca-certificates -f;
# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

ENV MALLET_HOME /app/mallet-2.0.8/bin/mallet
RUN export MALLET_HOME

# Directories architecture
WORKDIR /app
# Application
COPY . .

WORKDIR /app/mallet-2.0.8

RUN ant
RUN ant jar

RUN chmod +x /app/mallet-2.0.8/bin/mallet

RUN mkdir -p /data/TMmodels
RUN mkdir -p /data/wordlists
RUN mkdir -p /data/datasets

WORKDIR /app

ARG COMMANDS
ARG LOG_FILE

# Execution
CMD ["bash", "-c", "python ${COMMANDS} >> ${LOG_FILE} 2>&1"]

