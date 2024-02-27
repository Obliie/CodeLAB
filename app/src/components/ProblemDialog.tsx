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
import ProblemEditForm from './ProblemEditForm';

export default function ProblemDialog({ problem }: { problem: Problem | undefined }) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

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
                    <ProblemEditForm problem={undefined} update={false} close={handleClose}/>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}
