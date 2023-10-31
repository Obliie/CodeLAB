'use client';
import { RunCodeResponse } from '@/protobufs/services/v1/code_runner_service_pb';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function CodeOutput({ dataFetcher, code }: { dataFetcher: Function, code: string }) {
    const [data, setData] = useState("");

    return (
        <Stack direction="column" spacing={2} width="100%">
            <Card sx={{ width: '100%' }}>
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
                            setData("Waiting for response...");
                            const response: RunCodeResponse = await dataFetcher({code});
                            setData(response.stdout);
                        }}>
                        Submit
                    </Button>
                </CardActions>
            </Card>
        </Stack>
    );
}
