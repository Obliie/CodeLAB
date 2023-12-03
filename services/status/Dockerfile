FROM python:3.11.4-slim

COPY services/status/src/main /service/
COPY services/common/src/main /service/common/
COPY protobufs/build/python/protobufs /service/protobufs/

COPY services/status/requirements.txt requirements.txt
COPY services/common/common_requirements.txt common_requirements.txt

RUN pip3 install -r common_requirements.txt -r requirements.txt
