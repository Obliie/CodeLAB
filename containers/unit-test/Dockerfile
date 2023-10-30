FROM python:3.11.4-slim

ENV PYTHONPATH "${PYTHONPATH}:/service:/service_common:/protobufs"

COPY containers/unit-test/requirements.txt requirements.txt
COPY services/common/common_requirements.txt common-requirements.txt
COPY services/problem/requirements.txt problem-requirements.txt
COPY services/code-runner/requirements.txt code-runner-requirements.txt

RUN pip3 install -r requirements.txt -r common-requirements.txt -r problem-requirements.txt -r code-runner-requirements.txt
