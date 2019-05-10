#!/bin/bash

PROJECT_DIR=$(pwd)

cd "${PROJECT_DIR}/testing/javascript"
npm install --prefix . jasmine@3.4.0 @babel/core@7.4.4 @babel/register@7.4.4 @babel/preset-env@7.4.4

cd "${PROJECT_DIR}/testing/java"
MAVEN_DOWNLOAD_URL="http://search.maven.org/remotecontent?filepath="
curl -sL -o junit.jar "${MAVEN_DOWNLOAD_URL}org/junit/platform/junit-platform-console-standalone/1.4.2/junit-platform-console-standalone-1.4.2.jar"
curl -sL -o json.jar "${MAVEN_DOWNLOAD_URL}org/json/json/20180813/json-20180813.jar"
curl -sL -o javaparser.jar "${MAVEN_DOWNLOAD_URL}com/github/javaparser/javaparser-core/3.14.0/javaparser-core-3.14.0.jar"
javac -cp "*" *.java
