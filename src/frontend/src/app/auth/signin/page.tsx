"use client"
import { DeleteProblemRequest } from '@/actions/DeleteProblemRequest';
import ProblemActions from '@/components/ProblemActions';
import ProblemDialog from '@/components/ProblemDialog';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { RunCodeRequest } from '@/protobufs/services/v1/code_runner_service_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemSummariesResponse } from '@/protobufs/services/v1/problem_service_pb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Card, CardContent } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';

export default function SignInPage() {
    const { data: session } = useSession();

    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Login
                        </Typography>
                        {
                            session ? <Button variant="outlined" sx={{ margin: '10px' }} color='error' onClick={async () => { signOut() }}>Sign Out</Button> : <Button variant="outlined" sx={{ margin: '10px' }} color='error' onClick={async () => { signIn('google') }}>Sign In with Google</Button>
                        }
                        
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}
