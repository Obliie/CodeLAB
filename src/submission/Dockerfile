FROM python:3.11.4-slim

COPY src/submission/src/main /service/
COPY src/common/src/main /service/common/
COPY protobufs/build/python/protobufs /service/protobufs/

COPY src/submission/requirements.txt requirements.txt
COPY src/common/common_requirements.txt common_requirements.txt

RUN pip3 install -r common_requirements.txt -r requirements.txt

EXPOSE 19990
CMD watchmedo auto-restart --recursive --pattern="*.py" --directory="/service/" python3 /service/service.py