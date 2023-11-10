import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemSummariesResponse } from '@/protobufs/services/v1/problem_service_pb';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import * as React from 'react';

async function ProblemSummaries() {
    const problems = (await useServerClient(ProblemService)
        .getProblemSummaries({})
        .catch(err => handleGrpcError(err))) as GetProblemSummariesResponse;

    return problems ? (
        <Box width="100%" paddingTop="10px">
            {problems.problemSummaries.map(problem => (
                <Accordion key={problem.id}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{problem.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>{problem.summary}</Typography>
                    </AccordionDetails>
                    <AccordionActions>
                        <Link href={`/problem/${problem.id}`}>
                            <Button variant="contained" sx={{ margin: '10px' }}>
                                View
                            </Button>
                        </Link>
                    </AccordionActions>
                </Accordion>
            ))}
        </Box>
    ) : (
        <Typography>No problems found</Typography>
    );
}

export default function ProblemsPage() {
    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <React.Suspense fallback={<Skeleton width="100%" />}>
                    <ProblemSummaries />
                </React.Suspense>
            </Box>
        </Container>
    );
}
