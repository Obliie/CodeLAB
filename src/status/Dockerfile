FROM python:3.11.4-slim

COPY src/status/src/main /service/
COPY src/common/src/main /service/common/
COPY protobufs/build/python/protobufs /service/protobufs/

COPY src/status/requirements.txt requirements.txt
COPY src/common/common_requirements.txt common_requirements.txt

RUN pip3 install -r common_requirements.txt -r requirements.txt
