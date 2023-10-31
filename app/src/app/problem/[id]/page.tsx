import CodeEditor from '@/components/CodeEditor';
import ProblemTestData from '@/components/ProblemTestData';
import { useClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { CodeRunnerService } from '@/protobufs/services/v1/code_runner_service_connect';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import { SolutionFile, SolutionFileType } from '@/protobufs/common/v1/solution_pb';
import { useState } from 'react';
import CodeOutput from '@/components/CodeOutput';
import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemResponse } from '@/protobufs/services/v1/problem_service_pb';
import CodeSubmitter from '@/components/CodeSubmitter';


async function CodeRunRequester({ code }: {code: string}) {
    "use server"
    let mainFile: SolutionFile = new SolutionFile();
    mainFile.type = SolutionFileType.FILE_TYPE_SINGLE;
    mainFile.mainFile = true;
    mainFile.path = "main.py";

    const encoder = new TextEncoder(); 
    mainFile.data=encoder.encode(code);
    
    var client = createPromiseClient(CodeRunnerService, createGrpcWebTransport({
        baseUrl: 'http://0.0.0.0:8080/',
    }));

    var responses = await client.runCode({
        files: [mainFile],
        language: ProgrammingLanguage.PYTHON,
        hasDependencies: false
    });

    return responses;
}

async function Problem({ id }: { id: string }) {
    const problem = (await useClient(ProblemService)
        .getProblem({
            problemId: id,
        })
        .catch(err => handleGrpcError(err))) as GetProblemResponse;

    return problem.problem ? (
        <Stack direction="row" spacing={2} width="100%">
            <CodeSubmitter dataFetcher={CodeRunRequester}/>
            <Stack direction="column" spacing={2} width="100%">
                <Card sx={{ width: '100%' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {problem.problem?.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {problem.problem?.description}
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ width: '100%' }}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Test Data
                        </Typography>
                        <ProblemTestData testData={problem.problem.testData} />
                    </CardContent>
                </Card>
            </Stack>
        </Stack>
    ) : (
        <></>
    );
}

export default function ProblemPage({ params }: { params: { id: string } }) {
    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Problem id={params.id} />
            </Box>
        </Container>
    );
}
