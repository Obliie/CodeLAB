"use client"
import { useClient, useServerClient } from "@/lib/connect";
import { handleGrpcError } from "@/lib/error";
import { ProgrammingLanguage } from "@/protobufs/common/v1/language_pb";
import { Problem } from "@/protobufs/common/v1/problem_pb";
import { ProblemService } from "@/protobufs/services/v1/problem_service_connect";
import { UpdateProblemResponse } from "@/protobufs/services/v1/problem_service_pb";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { FormControlLabel, FormGroup } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { useState } from "react";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

function getLanguageDisplayName(language: ProgrammingLanguage) {
    switch(language) {
        case ProgrammingLanguage.PYTHON:
            return "Python"
        case ProgrammingLanguage.PROLOG:
            return "Prolog"
    }

    return "";
}

export default function ProblemEditForm({problem, updateProblem}: {problem: Problem, updateProblem: Function}) {
    const [problemState, setProblemState] = useState({
        title: problem.title,
        description: problem.description,
        supportedLanguages: problem.supportedLanguages.map((language) => {
            if (language === "PROGRAMMING_LANGUAGE_PYTHON") {
              return ProgrammingLanguage.PYTHON;
            } else if (language === "PROGRAMMING_LANGUAGE_PROLOG") {
              return ProgrammingLanguage.PROLOG;
            } else {
                return language;
            }
        }),
        displayTestData: problem.displayTestData
    });
    const problemServiceClient = useClient(ProblemService);

    const handleSubmit = async  () => {
      problem.title = problemState.title
      problem.description = problemState.description
      problem.supportedLanguages = problemState.supportedLanguages
      problem.displayTestData = problemState.displayTestData

      const response = (await problemServiceClient
          .updateProblem({
              problem: problem
          })
          .catch(err => handleGrpcError(err))) as UpdateProblemResponse;
    
      return response;
    }

    const allProgrammingLanguages = [ProgrammingLanguage.PYTHON, ProgrammingLanguage.PROLOG]

    return (
      <Box>
          <TextField
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
            <Autocomplete
                multiple
                id="supported-languages"
                options={allProgrammingLanguages}
                disableCloseOnSelect
                getOptionLabel={option => getLanguageDisplayName(option)}
                renderOption={(props, option, { selected }) => (
                    <li {...props} key={option}>
                        <Checkbox
                            key={option}
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        {getLanguageDisplayName(option)}
                    </li>
                )}
                renderInput={params => <TextField {...params} label="Supported Languages" />}
                sx={{ paddingTop: '15px' }}
                value={problemState.supportedLanguages}
                onChange={(event, newValue, reason) => {
                    if (
                      event.type === 'keydown' &&
                      ((event as React.KeyboardEvent).key === 'Backspace' ||
                        (event as React.KeyboardEvent).key === 'Delete') &&
                      reason === 'removeOption'
                    ) {
                      return;
                    }
                    setProblemState({...problemState, supportedLanguages: newValue.map((language) => {
                      if (language === "PROGRAMMING_LANGUAGE_PYTHON") {
                        return ProgrammingLanguage.PYTHON;
                      } else if (language === "PROGRAMMING_LANGUAGE_PROLOG") {
                        return ProgrammingLanguage.PROLOG;
                      } else {
                          return language;
                      }
                  })});
                  }}
            />
            <FormGroup sx={{ paddingTop: '10px' }}>
              <FormControlLabel control={
                  <Checkbox
                      key="display-test-data"
                      style={{ marginRight: 8 }}
                      checked={problemState.displayTestData}
                      onChange={event => {
                        setProblemState({...problemState, displayTestData: event.target.checked});
                      }}
                  />
                } label="Display Test Data" />
              </FormGroup>
            <Box textAlign="end" paddingTop="20px">
              <Button type="submit" variant="contained" onClick={handleSubmit}>Save</Button>
            </Box>
        </Box>
    );
}
