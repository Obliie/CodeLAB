"use client"
import { useClient, useServerClient } from "@/lib/connect";
import { handleGrpcError } from "@/lib/error";
import { Problem } from "@/protobufs/common/v1/problem_pb";
import { ProblemService } from "@/protobufs/services/v1/problem_service_connect";
import { UpdateProblemResponse } from "@/protobufs/services/v1/problem_service_pb";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useState } from "react";

export default function ProblemEditForm({problem, updateProblem}: {problem: Problem, updateProblem: Function}) {
    const [problemState, setProblemState] = useState({
        title: problem.title,
        description: problem.description
    });
    const problemServiceClient = useClient(ProblemService);

    console.log("AA: " + problem);
    console.log("BB: " + problemState);


    const handleSubmit = async  () => {
      console.log("making req... ")
      console.log("SS: " + problem)
      problem.title = problemState.title
      problem.description = problemState.description

      const response = (await problemServiceClient
          .updateProblem({
              problem: problem
          })
          .catch(err => handleGrpcError(err))) as UpdateProblemResponse;
    
      return response;
    }

    return (
      <form>
          <TextField
              autoFocus
              margin="dense"
              id="title"
              label="Title"
              value={problemState.title}
              type="text"
              fullWidth
              variant="standard"
              onChange={(event) => { setProblemState({...problemState, title: event.target.value} )}}
          />
          <TextField
              autoFocus
              margin="dense"
              id="description"
              label="Description"
              value={problemState.description}
              type="text"
              multiline
              fullWidth
              variant="standard"
              onChange={(event) => { setProblemState({...problemState, description: event.target.value} )}}
            />
            <Button type="submit" onClick={handleSubmit}>Save</Button>
      </form>
    );
}
