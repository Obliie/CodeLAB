'use client';
import { RunCodeResponse } from '@/protobufs/services/v1/code_runner_service_pb';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

export default function CodeOutput({ codeSubmitter, code }: { codeSubmitter: Function; code: string }) {
    const [data, setData] = useState('');

    return (
        <Card sx={{ width: '100%', height: '20vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Output
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {data ? data : 'Submit to see output'}
                </Typography>
            </CardContent>

            <CardActions sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
                <Button
                    sx={{ margin: '0px 10px', marginBottom: '10px' }}
                    variant="outlined"
                    onClick={async () => {
                        setData('Waiting for response...');
                        const response: RunCodeResponse = await codeSubmitter({ code });
                        setData(response.stdout);
                    }}>
                    Submit
                </Button>
            </CardActions>
        </Card>
    );
}
