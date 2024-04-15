'use client';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import CodeEditor from './CodeEditor';
import CodeOutput from './CodeOutput';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useSession } from 'next-auth/react';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import { useClient } from '@/lib/connect';
import { SubmissionService } from '@/protobufs/services/v1/submission_service_connect';
import { PromiseClient } from '@connectrpc/connect';
import {
    GetSubmissionProgressResponse,
    SubmissionStatusEvent,
    SubmitCodeResponse,
} from '@/protobufs/services/v1/submission_service_pb';
import { handleGrpcError } from '@/lib/error';
import { sinkAll } from '@connectrpc/connect/protocol';
import SuccessSnackbar from './SuccessSnackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { StatusService } from '@/protobufs/services/v1/status_service_connect';
import { SolutionFile } from '@/protobufs/common/v1/solution_pb';

function getLanguageDisplayName(language: string) {
    switch (language) {
        case 'PROGRAMMING_LANGUAGE_PYTHON':
            return 'Python';
        case 'PROGRAMMING_LANGUAGE_JAVASCRIPT':
            return 'JavaScript';
        case 'PROGRAMMING_LANGUAGE_JAVA':
            return 'Java';
        case 'PROGRAMMING_LANGUAGE_C':
            return 'C';
        case 'PROGRAMMING_LANGUAGE_PROLOG':
            return 'Prolog';
    }

    return '';
}

function getLanguage(language: string) {
    switch (language) {
        case 'PROGRAMMING_LANGUAGE_PYTHON':
            return ProgrammingLanguage.PYTHON;
        case 'PROGRAMMING_LANGUAGE_JAVASCRIPT':
            return ProgrammingLanguage.JAVASCRIPT;
        case 'PROGRAMMING_LANGUAGE_JAVA':
            return ProgrammingLanguage.JAVA;
        case 'PROGRAMMING_LANGUAGE_C':
            return ProgrammingLanguage.C;
        case 'PROGRAMMING_LANGUAGE_PROLOG':
            return ProgrammingLanguage.PROLOG;
    }

    return ProgrammingLanguage.UNSPECIFIED;
}

function LangageSelector({
    languages,
    curLanguage,
    setLanguage,
}: {
    languages: ProgrammingLanguage[];
    curLanguage: any;
    setLanguage: Function;
}) {
    const handleChange = (event: SelectChangeEvent) => {
        setLanguage(event.target.value);
    };

    return (
        <Box>
            <FormControl fullWidth sx={{ paddingTop: '5px', paddingBottom: '15px' }}>
                <Select label="Language" onChange={handleChange} defaultValue={curLanguage}>
                    {languages.map(language => (
                        <MenuItem value={language} key={language}>
                            {getLanguageDisplayName(language)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

function getMainFileName(language: ProgrammingLanguage) {
    switch (language) {
        case ProgrammingLanguage.PYTHON:
            return 'main.py';
        case ProgrammingLanguage.PROLOG:
            return 'main.pl';
        case ProgrammingLanguage.JAVA:
            return 'Main.java';
        case ProgrammingLanguage.JAVASCRIPT:
            return 'main.js'
        case ProgrammingLanguage.C:
            return 'main.c'
    }

    return 'main';
}

async function onCodeSubmit(
    handleSaveCode: Function,
    userId: string | null | undefined,
    code: string,
    setData: Function,
    submissionService: PromiseClient<typeof SubmissionService>,
    statusService: PromiseClient<typeof StatusService>,
    problem: Problem,
    language: ProgrammingLanguage,
    setSubmitLoading: Function,
) {
    setSubmitLoading(true);
    await handleSaveCode();

    const mainFile: SolutionFile = new SolutionFile();
    mainFile.entry = true;
    mainFile.path = getMainFileName(language);

    const encoder = new TextEncoder();
    mainFile.data = encoder.encode(code);

    setData([]);
    const submissionResponse = (await submissionService.submitCode({
        files: [mainFile],
        problemId: problem.id,
        userId: userId ?? 'none',
        language: language,
    })) as SubmitCodeResponse;

    for await (const response of statusService.subscribeStatusEvents({
        eventGroup: submissionResponse.submissionId,
        requestAll: true,
    })) {
        const event = SubmissionStatusEvent.fromJsonString(response.event);
        if (event && event.state) {
            setData((oldData: string[]) => [...oldData, event]);
        }
    }

    setSubmitLoading(false);
}

export default function CodeSubmitter({ problem, currentCode }: { problem: Problem; currentCode: string | undefined }) {
    const { data: session } = useSession();
    const [code, setCode] = useState(currentCode ? currentCode : '');
    const [saved, setSaved] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [language, setLanguage] = useState(problem.supportedLanguages[0]);
    const submissionServiceClient: PromiseClient<typeof SubmissionService> = useClient(SubmissionService);
    const submissionService: PromiseClient<typeof SubmissionService> = useClient(SubmissionService);
    const statusService: PromiseClient<typeof StatusService> = useClient(StatusService);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [data, setData] = useState<SubmissionStatusEvent[]>([]);

    const handleSaveCode = async () => {
        setSaveLoading(true);
        const encoder = new TextEncoder();

        await submissionServiceClient.updateSubmissionProgress({
            problemId: problem.id,
            userId: session?.user.email,
            data: encoder.encode(code),
        });

        setSaveLoading(false);
        setSaved(true);
    };

    return session ? (
        <Grid container spacing={2} direction="column">
            <Grid xs>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Solution
                        </Typography>
                        {language ? (
                            <Box>
                                <LangageSelector
                                    languages={problem.supportedLanguages}
                                    curLanguage={language}
                                    setLanguage={setLanguage}
                                />
                                <CodeEditor
                                    code={code}
                                    setCode={setCode}
                                    langEnum={undefined}
                                    language={language}
                                    readOnly={false}
                                />
                            </Box>
                        ) : (
                            <Typography>The problem author has not selected any supported languages...</Typography>
                        )}
                    </CardContent>
                    <CardActions sx={{ p: 2, flexDirection: 'row-reverse', gap: '15px' }}>
                        {submitLoading ? (
                            <LoadingButton
                                loading
                                variant="contained"
                                size="medium"
                                sx={{ padding: '19px' }}></LoadingButton>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={() =>
                                    onCodeSubmit(
                                        handleSaveCode,
                                        session?.user.email,
                                        code,
                                        setData,
                                        submissionService,
                                        statusService,
                                        problem,
                                        getLanguage(language),
                                        setSubmitLoading,
                                    )
                                }>
                                Submit
                            </Button>
                        )}
                        {saveLoading ? (
                            <LoadingButton
                                loading
                                variant="contained"
                                size="medium"
                                sx={{ paddingTop: '19px', paddingBottom: '19px' }}></LoadingButton>
                        ) : (
                            <Button variant="outlined" onClick={handleSaveCode}>
                                Save
                            </Button>
                        )}
                    </CardActions>
                    <SuccessSnackbar open={saved} setOpen={setSaved} message="Successfully saved code!" />
                </Card>
            </Grid>

            <Grid xs>
                <CodeOutput problem={problem} data={data} />
            </Grid>
        </Grid>
    ) : (
        <Card sx={{ minHeight: '100%' }}>
            <CardContent>
                <Typography>You must be signed in to make a submission...</Typography>
            </CardContent>
        </Card>
    );
}
