# ---------- Build stage ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /project

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
COPY mvnw.cmd mvnw.cmd

# Cache dependencies
RUN ./mvnw -q -DskipTests dependency:go-offline

# Copy source and build
COPY src src
RUN ./mvnw -q -DskipTests package

# ---------- Run stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Quarkus typical output: target/quarkus-app/*
COPY --from=build /project/target/quarkus-app/ /app/

# App Service expects single HTTP port; Quarkus default is 8080
EXPOSE 8080

# Make sure it listens on all interfaces inside container
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0"
CMD ["java","-jar","/app/quarkus-run.jar"]
