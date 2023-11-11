'use client';
import { useClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { CreateProblemResponse } from '@/protobufs/services/v1/problem_service_pb';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function ProblemDialog({ problem }: { problem: Problem | undefined }) {
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const problemServiceClient = useClient(ProblemService);
    const router = useRouter();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async  () => {
        const problem = new Problem();
        problem.title = title
        problem.description = description
        
        const response = await problemServiceClient.createProblem({
            problem: problem
        })
        .catch(err => handleGrpcError(err)) as CreateProblemResponse;
        
        if (response.problem) {
            router.push(`/problem/${response.problem.id}`)
        }

        setOpen(false);
    };

    return (
        <React.Fragment>
            <Box textAlign='end'>
                <Button variant="outlined" onClick={handleClickOpen}>
                    Create Problem
                </Button>
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Problem</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="title"
                        label="Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={(event) => { setTitle(event.target.value)}}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="description"
                        label="Description"
                        type="text"
                        multiline
                        fullWidth
                        variant="standard"
                        onChange={(event) => { setDescription(event.target.value)}}
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
