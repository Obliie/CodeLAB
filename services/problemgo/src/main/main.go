package main

import (
	"log"
	"net"
	"fmt"
	"io/ioutil"
	"context"


	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

    "google.golang.org/grpc"
    "codelab/pkg/problem"
    "codelab/protobufs/services/v1"
)

var (
    DATABASE_HOST string  = "problem-db"
    DATABASE_PORT int     = 27001
    DATABASE_NAME string  = "problem"
)

func readFile(path string) (string, error) {
	content, err := ioutil.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

func main() {
	database_username_file, err := readFile("../run/secrets/problemdb-root-username")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	database_password_file, err := readFile("../run/secrets/problemdb-root-password")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	MONGO_URI := fmt.Sprintf("mongodb://%s:%s@%s:%d/%s?authSource=admin",
	database_username_file, database_password_file, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME)

    clientOptions := options.Client().ApplyURI(MONGO_URI)
    client, err := mongo.Connect(context.Background(), clientOptions)
	
    if err != nil {
        log.Fatal(err)
    }

	// Check the connection.
	err = client.Ping(context.Background(), nil)
	if err != nil {
	log.Fatal(err)
	}

	// Create collection
	client.Database("testdb").Collection("test")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to db")

	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", 19990))
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}


	// Create new gRPC server instance
	s := problem.Server{}
	grpcServer := grpc.NewServer()


	// Register gRPC server
	v1.RegisterProblemServiceServer(grpcServer, &s)

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %s", err)
	}
}
