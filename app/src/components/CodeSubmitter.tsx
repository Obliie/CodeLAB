'use client';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import CodeEditor from './CodeEditor';
import CodeOutput from './CodeOutput';
import { Problem } from '@/protobufs/common/v1/problem_pb';

export default function CodeSubmitter({ problem }: { problem: Problem}) {
    const [code, setCode] = useState('');

    return (
        <Stack direction="column" spacing={2} width="100%">
            <Card sx={{ width: '35vw', height: '60vh' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Solution
                    </Typography>
                    <CodeEditor setCode={setCode} />
                </CardContent>
            </Card>

            <CodeOutput code={code} problem={problem}/>
        </Stack>
    );
}
