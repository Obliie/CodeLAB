'use client';
import { useClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { Problem, Problem_TestData } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { AddTestDataResponse, CreateProblemResponse } from '@/protobufs/services/v1/problem_service_pb';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function TestDataDialog({ testData, problem_id }: { testData: Problem_TestData | undefined, problem_id: string }) {
    const [open, setOpen] = React.useState(false);
    const [args, setArgs] = React.useState('');
    const [expectedStdout, setExpectedStdout] = React.useState('');
    const problemServiceClient = useClient(ProblemService);
    const router = useRouter();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async  () => {
        const testData = new Problem_TestData();
        testData.arguments = args;
        testData.expectedStdout = expectedStdout;
        
        await problemServiceClient.addTestData({
            problemId: problem_id,
            tests: [testData]
        })
        .catch(err => handleGrpcError(err)) as AddTestDataResponse;

        router.refresh();
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Box textAlign='end' sx={{marginBottom: '16px'}}>
                <Button variant="outlined" onClick={handleClickOpen}>
                    Create Test Data
                </Button>
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Test Data</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="arguments"
                        label="Arguments"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={(event) => { setArgs(event.target.value)}}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="expected-stdout"
                        label="Expected Stdout"
                        type="text"
                        multiline
                        fullWidth
                        variant="standard"
                        onChange={(event) => { setExpectedStdout(event.target.value)}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
