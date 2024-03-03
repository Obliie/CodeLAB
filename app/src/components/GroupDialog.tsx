'use client';
import { useClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { Problem, ProblemGroup, ProblemSummary } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { CreateProblemGroupResponse, CreateProblemResponse, GetProblemSummariesResponse } from '@/protobufs/services/v1/problem_service_pb';
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
import GroupEditForm from './GroupEditForm';

export default function GroupDialog({ group, problems }: { group: ProblemGroup | undefined, problems: ProblemSummary[] }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
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
                    <GroupEditForm group={undefined} problems={problems} update={false} close={handleClose} />
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}
