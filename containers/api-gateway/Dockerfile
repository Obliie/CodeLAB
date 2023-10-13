FROM envoyproxy/envoy:v1.27-latest

ARG PROBLEM_SERVICE_PORT

COPY ./containers/api-gateway/envoy.json /etc/envoy/envoy.json
RUN sed -i s/PROBLEM_SERVICE_PORT/${PROBLEM_SERVICE_PORT}/g /etc/envoy/envoy.json
