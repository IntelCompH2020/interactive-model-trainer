####################################### Build stage #######################################
FROM maven:3.8.6-openjdk-11-slim AS build-stage

ARG CITE_MAVEN_ACCOUNT_USR
ARG CITE_MAVEN_ACCOUNT_PSW

COPY pom.xml /build/
COPY interactive-model-trainer /build/interactive-model-trainer/
COPY interactive-model-trainer-web /build/interactive-model-trainer-web/
COPY settings.xml /root/.m2/settings.xml
RUN rm -f /build/interactive-model-trainer-web/src/main/resources/config/app.env
RUN rm -f /build/interactive-model-trainer-web/src/main/resources/config/*-dev.yml
RUN rm -f /build/interactive-model-trainer-web/src/main/resources/logging/*.xml
RUN rm -f /build/interactive-model-trainer-web/src/main/resources/certificates/*.crt

WORKDIR /build/

RUN mvn -Dserver.username=${CITE_MAVEN_ACCOUNT_USR} -Dserver.password=${CITE_MAVEN_ACCOUNT_PSW} dependency:go-offline 
# Build project
RUN mvn -Dserver.username=${CITE_MAVEN_ACCOUNT_USR} -Dserver.password=${CITE_MAVEN_ACCOUNT_PSW} clean package

######################################## Run Stage ########################################
FROM adoptopenjdk:11.0.8_10-jre-hotspot-bionic

ENV SERVER_PORT=8080
EXPOSE ${SERVER_PORT}

COPY --from=build-stage /build/interactive-model-trainer-web/target/interactive-model-trainer-web.jar /app/interactive-model-trainer-web.jar

ENTRYPOINT ["java","-Dspring.config.additional-location=file:/config/","-Dspring.profiles.active=${PROFILE}","-Djava.security.egd=file:/dev/./urandom","-jar","/app/interactive-model-trainer-web.jar"]