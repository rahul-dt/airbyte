./gradlew :airbyte-integrations:bases:base-normalization:build -x :airbyte-integrations:bases:base-normalization:unitTest

docker tag airbyte/normalization:dev airbyte/normalization:<current-normalization-version>
