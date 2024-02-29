'use client';
import { useClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { Problem, ProblemGroup } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { CreateProblemGroupResponse, CreateProblemResponse } from '@/protobufs/services/v1/problem_service_pb';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function GroupDialog({ group }: { group: ProblemGroup | undefined }) {
    const { data: session } = useSession();
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');
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
        if (!session) {
            return;
        }
        
        const group = new ProblemGroup();
        group.name = name
        group.description = description
        group.owner = session?.user.id
        
        const response = await problemServiceClient.createProblemGroup({
            group: group
        })
        .catch(err => handleGrpcError(err)) as CreateProblemGroupResponse;
        
        if (response.group) {
            router.push(`/group/${response.group.id}`)
        }

        setOpen(false);
    };

    return (
        <React.Fragment>
            <Box textAlign='end'>
                <Button variant="outlined" onClick={handleClickOpen}>
                    Create Group
                </Button>
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Create Group</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Name"
                        type="text"
                        fullWidth
                        onChange={(event) => { setName(event.target.value)}}
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
