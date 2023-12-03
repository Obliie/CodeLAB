FROM envoyproxy/envoy:v1.28-latest

ARG FRONTEND_PORT
ARG PROBLEM_SERVICE_PORT
ARG SUBMISSION_SERVICE_PORT
ARG STATUS_SERVICE_PORT

COPY ./containers/api-gateway/envoy.json /etc/envoy/envoy.json
RUN sed -i s/PROBLEM_SERVICE_PORT/${PROBLEM_SERVICE_PORT}/g /etc/envoy/envoy.json &&\
    sed -i s/SUBMISSION_SERVICE_PORT/${SUBMISSION_SERVICE_PORT}/g /etc/envoy/envoy.json &&\
    sed -i s/STATUS_SERVICE_PORT/${STATUS_SERVICE_PORT}/g /etc/envoy/envoy.json &&\
    sed -i s/FRONTEND_PORT/${FRONTEND_PORT}/g /etc/envoy/envoy.json
