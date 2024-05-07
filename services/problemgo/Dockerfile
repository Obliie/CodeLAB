FROM golang:1.22.2

WORKDIR /service

COPY services/problemgo/src/main .
COPY protobufs/build/go/protobufs ./protobufs/

RUN go install github.com/cosmtrek/air@latest

RUN go get

EXPOSE 19990