# Base image
FROM ubuntu:20.04

# Install python
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get update && apt-get install -y \
    python3.8 \
    python3-distutils \
    python3-pip \
    python3-apt

RUN apt install python-is-python3

RUN pip install dask==2022.7.1 gensim==4.2.0 matplotlib==3.5.2 nltk==3.7 numpy==1.23.1 pandas==1.4.3 pyarrow==8.0.0 pyLDAvis==3.3.1 pyspark==3.3.0 scikit_learn==1.1.3 scipy==1.8.1 sentence_transformers==2.2.2 torch==1.12.0 tqdm==4.64.0 transformers==4.21.0

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

