package problem

import (
    "log"
    "context"
    services "codelab/protobufs/services/v1"
    common "codelab/protobufs/common/v1"
)

type Server struct {
	services.UnimplementedProblemServiceServer
}

func (s *Server) AddTestData(ctx context.Context, req *services.AddTestDataRequest) (*services.AddTestDataResponse, error) {
	log.Printf("Received Title from client: %s", req.ProblemId) // Corrected field name from req.id to req.ProblemId
	return &services.AddTestDataResponse{Success: true}, nil // Corrected field name to Success
}

func (s *Server) RemoveTestData(ctx context.Context, req *services.RemoveTestDataRequest) (*services.RemoveTestDataResponse, error) {
	log.Printf("Received Title from client: %s", req.ProblemId) // Corrected field name from req.id to req.ProblemId
	return &services.RemoveTestDataResponse{Success: true}, nil // Corrected field name to Success
}

func (s *Server) UpdateTestData(ctx context.Context, req *services.UpdateTestDataRequest) (*services.UpdateTestDataResponse, error) {
	log.Printf("Received Title from client: %s", req.Test.Id) // Corrected field name from req.id to req.ProblemId
	return &services.UpdateTestDataResponse{Success: true}, nil // Corrected field name to Success
}

func (s *Server) CreateProblem(ctx context.Context, req *services.CreateProblemRequest) (*services.CreateProblemResponse, error) {
	log.Printf("Received Title from client: %s", req.Problem.Id) 
	return &services.CreateProblemResponse{Success: true}, nil // 
}

func (s *Server) UpdateProblem(ctx context.Context, req *services.UpdateProblemRequest) (*services.UpdateProblemResponse, error) {
    log.Printf("Received Title from client: %s", req.Problem.Id) 
    return &services.UpdateProblemResponse{Success: true}, nil // 
}

func (s *Server) CreateProblemGroup(ctx context.Context, req *services.CreateProblemGroupRequest) (*services.CreateProblemGroupResponse, error) {
	log.Printf("Received Title from client: %s", req.Group.Id) 
	return &services.CreateProblemGroupResponse{Success: true}, nil // 
}

func (s *Server) UpdateProblemGroup(ctx context.Context, req *services.UpdateProblemGroupRequest) (*services.UpdateProblemGroupResponse, error) {
    log.Printf("Received Title from client: %s", req.Group.Id) 
    return &services.UpdateProblemGroupResponse{Success: true}, nil // 
}

func (s *Server) DeleteProblem(ctx context.Context, req *services.DeleteProblemRequest) (*services.DeleteProblemResponse, error) {
	log.Printf("Received Title from client: %s", req.ProblemId) 
	return &services.DeleteProblemResponse{Success: true}, nil // 
}

func (s *Server) DeleteProblemGroup(ctx context.Context, req *services.DeleteProblemGroupRequest) (*services.DeleteProblemGroupResponse, error) {
	log.Printf("Received Title from client: %s", req.GroupId) 
	return &services.DeleteProblemGroupResponse{Success: true}, nil // 
}


func (s *Server) GetProblem(ctx context.Context, req *services.GetProblemRequest) (*services.GetProblemResponse, error) {
    log.Printf("Received Title from client: %s", req.ProblemId) 

    // Initialize a Problem struct
    p := common.Problem{
        Id: "42", 
    }

    response := &services.GetProblemResponse{
        Problem: &p,
    }

    return response, nil
}

func (s *Server) GetProblemGroup(ctx context.Context, req *services.GetProblemGroupRequest) (*services.GetProblemGroupResponse, error) {
    log.Printf("Received Title from client: %s", req.GroupId) 

    // Initialize a Problem struct
    p := common.ProblemGroup{
        Id: "42", 
    }

    response := &services.GetProblemGroupResponse{
        Group: &p,
    }

    return response, nil
}

func (s *Server) GetProblemGroupList(ctx context.Context, req *services.GetProblemGroupListRequest) (*services.GetProblemGroupListResponse, error) {
    log.Printf("Received Title from client: %s", req.Limit) 

    // Initialize a Problem struct
    p1 := common.ProblemGroup{
        Id: "42", 
    }

	p2 := common.ProblemGroup{
        Id: "41", 
    }

	// Put them in a slice
	problemGroups := []*common.ProblemGroup{&p1, &p2}

    response := &services.GetProblemGroupListResponse{
        Groups: problemGroups,
    }
	
    return response, nil
}

func (s *Server) GetProblemSummaries(ctx context.Context, req *services.GetProblemSummariesRequest) (*services.GetProblemSummariesResponse, error) {
    log.Printf("Received Title from client: %s", req.Limit) 

    // Initialize a Problem struct
    p1 := common.ProblemSummary{
        Id: "42", 
    }

	p2 := common.ProblemSummary{
        Id: "41", 
    }

	// Put them in a slice
	GetProblemSummaries := []*common.ProblemSummary{&p1, &p2}

    response := &services.GetProblemSummariesResponse{
        ProblemSummaries: GetProblemSummaries,
    }
	
    return response, nil
}
