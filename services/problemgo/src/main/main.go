package main

import (
	"log"
	"net"

    "google.golang.org/grpc"
    "codelab/pkg/problem"
    "codelab/protobufs/services/v1"

)

func main() {
	// Create new gRPC server instance
	s := problem.Server{}
	grpcServer := grpc.NewServer()


	// Register gRPC server
	v1.RegisterProblemServiceServer(grpcServer, &s)
}