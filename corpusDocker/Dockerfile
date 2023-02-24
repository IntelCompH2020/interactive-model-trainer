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

# Directories architecture
WORKDIR /app
RUN mkdir -p /data/datasets

# Application
COPY manageCorpus.py .

# Execution
ENTRYPOINT ["bash"]
# ENTRYPOINT ["python", "manageCorpus.py", "--path_datasets", "/data/datasets"]
# CMD ["-h"]
