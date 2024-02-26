"use client"
import { useClient, useServerClient } from "@/lib/connect";
import { handleGrpcError } from "@/lib/error";
import { ProgrammingLanguage } from "@/protobufs/common/v1/language_pb";
import { Problem, ProblemGroup, ProblemSummary } from "@/protobufs/common/v1/problem_pb";
import { ProblemService } from "@/protobufs/services/v1/problem_service_connect";
import { UpdateProblemGroupResponse, UpdateProblemResponse } from "@/protobufs/services/v1/problem_service_pb";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import MultiProblemSelect from "./MultiProblemSelect";

export default function GroupEditForm({ group, problems }: { group: ProblemGroup, problems: ProblemSummary[] }) {
    const [groupState, setGroupState] = useState({
        name: group.name,
        description: group.description,
    });
    const [selectedProblems, setSelectedProblems] = useState<ProblemSummary[]>(
        problems.filter(problem => group.problemIds.includes(problem.id))
    );

    const problemServiceClient = useClient(ProblemService);

    const handleSubmit = async  () => {
      group.name = groupState.name
      group.description = groupState.description
      group.problemIds = selectedProblems.map(problem => problem.id);

      const response = (await problemServiceClient
          .updateProblemGroup({
              group: group
          })
          .catch(err => handleGrpcError(err))) as UpdateProblemGroupResponse;
    
      return response;
    }


    return (
      <Box>
          <TextField
              margin="dense"
              id="name"
              label="Name"
              value={groupState.name}
              type="text"
              fullWidth
              variant="standard"
              onChange={(event) => { setGroupState({...groupState, name: event.target.value} )}}
          />
          <TextField
              margin="dense"
              id="description"
              label="Description"
              value={groupState.description}
              type="text"
              multiline
              fullWidth
              variant="standard"
              onChange={(event) => { setGroupState({...groupState, description: event.target.value} )}}
            />
            <MultiProblemSelect selectedProblems={selectedProblems} setSelectedProblems={setSelectedProblems} problems={problems} />
            <Box textAlign="end" paddingTop="20px">
              <Button type="submit" variant="contained" onClick={handleSubmit}>Save</Button>
            </Box>
      </Box>
    );
}
