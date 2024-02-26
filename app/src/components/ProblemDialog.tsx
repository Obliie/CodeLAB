'use client';
import { useClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { CreateProblemResponse } from '@/protobufs/services/v1/problem_service_pb';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Autocomplete, Box, Checkbox, FormControlLabel, FormGroup, InputAdornment, Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import * as React from 'react';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

function getLanguageDisplayName(language: ProgrammingLanguage) {
    switch (language) {
        case ProgrammingLanguage.PYTHON:
            return 'Python';
        case ProgrammingLanguage.PROLOG:
            return 'Prolog';
    }

    return '';
}

export default function ProblemDialog({ problem }: { problem: Problem | undefined }) {
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [supportedLanguages, setSupportedLanguages] = React.useState<ProgrammingLanguage[]>([]);
    const [runTimeout, setRunTimeout] = React.useState(30);
    const [runMaxMemory, setRunMaxMemory] = React.useState(512);
    const [displayTestData, setDisplayTestData] = React.useState(true);
    const problemServiceClient = useClient(ProblemService);
    const router = useRouter();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async () => {
        const problem = new Problem();
        problem.title = title;
        problem.description = description;
        problem.supportedLanguages = supportedLanguages;
        problem.runTimeout = runTimeout;
        problem.runMaxMemory = runMaxMemory;

        const response = (await problemServiceClient
            .createProblem({
                problem: problem,
            })
            .catch(err => handleGrpcError(err))) as CreateProblemResponse;

        if (response.problem) {
            router.push(`/problem/${response.problem.id}`);
        }

        setOpen(false);
    };

    const allProgrammingLanguages = [ProgrammingLanguage.PYTHON, ProgrammingLanguage.PROLOG];

    return (
        <React.Fragment>
            <Box textAlign="end">
                <Button variant="outlined" onClick={handleClickOpen}>
                    Create Problem
                </Button>
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Create Problem</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="title"
                        label="Title"
                        type="text"
                        fullWidth
                        onChange={event => {
                            setTitle(event.target.value);
                        }}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="description"
                        label="Description"
                        type="text"
                        multiline
                        fullWidth
                        onChange={event => {
                            setDescription(event.target.value);
                        }}
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
                        sx={{ paddingTop: '8px' }}
                        value={supportedLanguages}
                        onChange={(event, newValue, reason) => {
                            if (
                                event.type === 'keydown' &&
                                ((event as React.KeyboardEvent).key === 'Backspace' ||
                                    (event as React.KeyboardEvent).key === 'Delete') &&
                                reason === 'removeOption'
                            ) {
                                return;
                            }
                            setSupportedLanguages(newValue);
                        }}
                    />
                    <Stack direction="row" spacing={2} sx={{ paddingTop: '15px'}}>
                        <TextField
                            fullWidth
                            label="Run Timeout"
                            id="run-timeout"
                            type='number'
                            value={runTimeout}
                            onChange={event => setRunTimeout(parseInt(event.target.value))}
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
                            id="run-memory-limit"
                            type='number'
                            value={runMaxMemory}
                            onChange={event => setRunMaxMemory(parseInt(event.target.value))}
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    key="display-test-data"
                                    style={{ marginRight: 8 }}
                                    checked={displayTestData}
                                    onChange={event => {
                                        setDisplayTestData(event.target.checked);
                                    }}
                                />
                            }
                            label="Display Test Data"
                        />
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
