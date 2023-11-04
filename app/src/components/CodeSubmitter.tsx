'use client';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import CodeEditor from './CodeEditor';
import CodeOutput from './CodeOutput';

export default function CodeSubmitter({ codeSubmitter }: { codeSubmitter: Function }) {
    const [code, setCode] = useState('');

    return (
        <Stack direction="column" spacing={2} width="100%">
            <Card sx={{ width: '100%' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Solution
                    </Typography>
                    <CodeEditor setCode={setCode} />
                </CardContent>
            </Card>
            <Card sx={{ width: '100%' }}>
                <CodeOutput codeSubmitter={codeSubmitter} code={code} />
            </Card>
        </Stack>
    );
}
