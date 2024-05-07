package problem

import (
	"log"
	"context"
	"codelab/protobufs/services/v1"
)

type Server struct {
}

func (s *Server) AddTestData(ctx context.Context, req *v1.AddTestDataRequest) (*v1.AddTestDataResponse, error) {
	log.Printf("Received Title from client: %s", req.ProblemId) // Corrected field name from req.id to req.ProblemId
	return &v1.AddTestDataResponse{Success: true}, nil // Corrected field name to Success
}
