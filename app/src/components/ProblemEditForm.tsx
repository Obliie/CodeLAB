"use client"
import { useClient, useServerClient } from "@/lib/connect";
import { handleGrpcError } from "@/lib/error";
import { ProgrammingLanguage } from "@/protobufs/common/v1/language_pb";
import { Problem } from "@/protobufs/common/v1/problem_pb";
import { ProblemService } from "@/protobufs/services/v1/problem_service_connect";
import { CreateProblemResponse, UpdateProblemResponse } from "@/protobufs/services/v1/problem_service_pb";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { FormControlLabel, FormGroup, InputAdornment, Stack } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getLanguageDisplayName(language: ProgrammingLanguage) {
    switch(language) {
        case ProgrammingLanguage.PYTHON:
            return "Python"
        case ProgrammingLanguage.PROLOG:
            return "Prolog"
    }

    return "";
}

export default function ProblemEditForm({ problem, update, close }: { problem: Problem | undefined, update: boolean, close: any }) {
    const [problemState, setProblemState] = useState({
        title: {
            value: problem ? problem.title : "",
            error: problem ? false : true,
            errorMessage: "You must provide a title",
        },
        description: {
            value: problem ? problem.description : "",
            error: problem ? false : true,
            errorMessage: "You must provide a description",
        },
        supportedLanguages: {
            value: problem ? problem.supportedLanguages.map((language) => {
                if (language === "PROGRAMMING_LANGUAGE_PYTHON") {
                return ProgrammingLanguage.PYTHON;
                } else if (language === "PROGRAMMING_LANGUAGE_PROLOG") {
                return ProgrammingLanguage.PROLOG;
                } else {
                    return language;
                }
            }) : [],
            error: problem ? false : true,
            errorMessage: "You must select at least one supported language",
        },
        displayTestData: problem ? problem.displayTestData : true,
        runTimeout: {
            value: problem ? problem.runTimeout : 30,
            error: false,
            errorMessage: "The run timeout must be a value between 0s and 600s",
        },
        runMaxMemory: {
            value: problem ? problem.runMaxMemory : 512,
            error: false,
            errorMessage: "The run max memory must be a value between 128MB and 1024MB",
        },
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitEnabled, setSubmitEnabled] = useState(false);

    const problemServiceClient = useClient(ProblemService);
    const router = useRouter();
    const handleSubmit = async  () => {
        setSubmitLoading(true);

        for (let key in problemState) {
            if (problemState[key].error) {
                setSubmitEnabled(false);
                setSubmitLoading(false);
                return;
            }
        }

        if (!problem) {
            problem = new Problem();
        }

        problem.title = problemState.title.value;
        problem.description = problemState.description.value;
        problem.supportedLanguages = problemState.supportedLanguages.value;
        problem.displayTestData = problemState.displayTestData;
        problem.runTimeout = problemState.runTimeout.value;
        problem.runMaxMemory = problemState.runMaxMemory.value;

        if (update) {
            const response = (await problemServiceClient
                .updateProblem({
                    problem: problem
                })
                .catch(err => handleGrpcError(err))) as UpdateProblemResponse;
                
            setSubmitLoading(false);
        } else {
            const response = (await problemServiceClient
                .createProblem({
                    problem: problem,
                })
                .catch(err => handleGrpcError(err))) as CreateProblemResponse;
            
            setSubmitLoading(false);
            if (response.problem) {
                router.push(`/problem/${response.problem.id}`);
            }
        }
    }

    const allProgrammingLanguages = [ProgrammingLanguage.PYTHON, ProgrammingLanguage.PROLOG]

    const [edited, setEdited] = useState(false)
    const handleChange = (e: { target: { name: string; value: any; }; }) => {
        setEdited(true);

        const {name, value}: { name: string, value: any} = e.target;
        if (typeof value === 'string' && value === '') {
            setProblemState({
                ...problemState,
                [name] : {
                    ...problemState[name],
                    value,
                    error: true
                }
            });
        } else {
            setProblemState({
                ...problemState,
                [name] : {
                    ...problemState[name],
                    value,
                    error: false
                }
            });
        }
    }

    // Disable submit if a field has an active error
    useEffect(() => {
        if (!edited) return;

        var invalidField = false;
        for (let key in problemState) {
            if (problemState[key].error) {
                setSubmitEnabled(false);
                invalidField = true;
                break;
            }
        }

        if (!invalidField) {
            setSubmitEnabled(true);
        }
    }, [problemState, edited]);
    

    return (
      <Box>
          <TextField
              margin="dense"
              id="title"
              name="title"
              label="Title"
              value={problemState.title.value}
              type="text"
              fullWidth
              onChange={handleChange}
              error={problemState.title.error}
              helperText={problemState.title.error && problemState.title.errorMessage}
          />
          <TextField
              margin="dense"
              id="description"
              name="description"
              label="Description"
              value={problemState.description.value}
              type="text"
              multiline
              fullWidth
              onChange={handleChange}
              error={problemState.description.error}
              helperText={problemState.description.error && problemState.description.errorMessage}
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
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        {getLanguageDisplayName(option)}
                    </li>
                )}
                renderInput={params => { return (
                    <TextField 
                        {...params} 
                        label="Supported Languages"
                        error={problemState.supportedLanguages.error}
                        helperText={problemState.supportedLanguages.error && problemState.supportedLanguages.errorMessage}
                    />
                )}}
                sx={{ paddingTop: '8px' }}
                value={problemState.supportedLanguages.value}
                onChange={(event, newValue, reason) => {
                    if (
                        event.type === 'keydown' &&
                        ((event as React.KeyboardEvent).key === 'Backspace' ||
                            (event as React.KeyboardEvent).key === 'Delete') &&
                        reason === 'removeOption'
                    ) {
                        return;
                    }

                    if (newValue.length == 0) {
                        setProblemState({...problemState, supportedLanguages: {
                            ...problemState.supportedLanguages,
                            value: newValue.map((language) => {
                                if (language === "PROGRAMMING_LANGUAGE_PYTHON") {
                                    return ProgrammingLanguage.PYTHON;
                                } else if (language === "PROGRAMMING_LANGUAGE_PROLOG") {
                                    return ProgrammingLanguage.PROLOG;
                                } else {
                                    return language;
                                }
                            }),
                            error: true
                        }});
                    } else {
                        setProblemState({...problemState, supportedLanguages: {
                            ...problemState.supportedLanguages,
                            value: newValue.map((language) => {
                                if (language === "PROGRAMMING_LANGUAGE_PYTHON") {
                                    return ProgrammingLanguage.PYTHON;
                                } else if (language === "PROGRAMMING_LANGUAGE_PROLOG") {
                                    return ProgrammingLanguage.PROLOG;
                                } else {
                                    return language;
                                }
                            }),
                            error: false
                        }});
                    }
                }}
            />
            <Stack direction="row" spacing={2} sx={{ paddingTop: '15px' }}>
                <TextField
                    fullWidth
                    label="Run Timeout"
                    id="run-timeout"
                    name="runTimeout"
                    type='number'
                    value={problemState.runTimeout.value}
                    onChange={handleChange}
                    error={problemState.runTimeout.error}
                    helperText={problemState.runTimeout.error && problemState.runTimeout.errorMessage}
                    InputProps={{
                        type: 'number',
                        inputProps: {
                            min: 0,
                            max: 600
                        },
                        endAdornment: <InputAdornment position="end">s</InputAdornment>,
                    }}
                />
                <TextField
                    fullWidth
                    label="Run Memory Limit"
                    id="run-max-memory"
                    name="runMaxMemory"
                    type='number'
                    value={problemState.runMaxMemory.value}
                    onChange={handleChange}
                    error={problemState.runMaxMemory.error}
                    helperText={problemState.runMaxMemory.error && problemState.runTimeout.errorMessage}
                    InputProps={{
                        type: 'number',
                        inputProps: {
                            min: 0,
                            max: 1024
                        },
                        endAdornment: <InputAdornment position="end">MB</InputAdornment>,
                    }}
                />
            </Stack>
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
            <Box textAlign="end" paddingTop="20px" sx={{display: 'flex', justifyContent: 'flex-end', gap: '15px'}}>
                {close !== undefined ? (<Button type='button' variant="outlined" onClick={close}>Close</Button>) : (<></>)}
                {submitLoading ? 
                    (<LoadingButton loading variant="contained" size='medium' sx={{ paddingTop: '19px', paddingBottom: '19px' }}></LoadingButton>) :
                    (<Button type="submit" variant="contained" disabled={!submitEnabled} onClick={handleSubmit}>Save</Button>)
                }
            </Box>
        </Box>
    );
}
