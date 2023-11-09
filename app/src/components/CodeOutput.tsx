import { transport, useClient } from '@/lib/connect';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import { SolutionFile, SolutionFileType } from '@/protobufs/common/v1/solution_pb';
import { CodeRunnerService } from '@/protobufs/services/v1/code_runner_service_connect';
import { RunCodeResponse } from '@/protobufs/services/v1/code_runner_service_pb';
import { PromiseClient, createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

async function onCodeSubmit(
    code: string,
    data: string[],
    setData: Function,
    codeRunnerService: PromiseClient<typeof CodeRunnerService>,
) {
    const mainFile: SolutionFile = new SolutionFile();
    mainFile.type = SolutionFileType.FILE_TYPE_SINGLE;
    mainFile.mainFile = true;
    mainFile.path = 'main.py';

    const encoder = new TextEncoder();
    mainFile.data = encoder.encode(code);

    setData([]);
    for await (const response of codeRunnerService.runCode({
        files: [mainFile],
        language: ProgrammingLanguage.PYTHON,
        hasDependencies: false,
    })) {
        setData((oldData: string[]) => [...oldData, response.stdout]);
    }
}

export default function CodeOutput({ code }: { code: string }) {
    const [data, setData] = useState<string[]>([]);
    const codeRunnerService: PromiseClient<typeof CodeRunnerService> = useClient(CodeRunnerService);

    return (
        <Card
            sx={{
                width: '35vw',
                height: '20vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Output
                </Typography>
                {data.map(data => {
                    return (
                        <Typography variant="body2" color="text.secondary" display="block" key="">
                            {data}
                        </Typography>
                    );
                })}
            </CardContent>

            <CardActions sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
                <Button
                    sx={{ margin: '0px 10px', marginBottom: '10px' }}
                    variant="outlined"
                    onClick={() => onCodeSubmit(code, data, setData, codeRunnerService)}>
                    Submit
                </Button>
            </CardActions>
        </Card>
    );
}
