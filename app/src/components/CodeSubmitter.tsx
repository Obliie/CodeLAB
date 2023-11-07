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
            <Card sx={{ width: '35vw', height: '60vh' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Solution
                    </Typography>
                    <CodeEditor setCode={setCode} />
                </CardContent>
            </Card>
            <CodeOutput codeSubmitter={codeSubmitter} code={code} />
        </Stack>
    );
}
