import { DeleteProblemRequest } from '@/actions/DeleteProblemRequest';
import ProblemActions from '@/components/ProblemActions';
import ProblemDialog from '@/components/ProblemDialog';
import ProblemSummaryAccordion from '@/components/ProblemSummaryAccordion';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { RunCodeRequest } from '@/protobufs/services/v1/code_runner_service_pb';
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
import { useRouter } from 'next/navigation';
import * as React from 'react';

// Opt out of caching for all data requests in the route segment
export const dynamic = 'force-dynamic'

async function ProblemSummaries() {
    const problems = (await useServerClient(ProblemService)
        .getProblemSummaries({})
        .catch(err => handleGrpcError(err))) as GetProblemSummariesResponse;

    return problems ? (
        <Box width="100%" paddingTop="10px">
            <ProblemSummaryAccordion problemSummaries={problems.problemSummaries} deleteProblem={DeleteProblemRequest} nav="" />
        </Box>
    ) : (
        <Typography>No problems found</Typography>
    );
}

export default function ProblemsListPage() {
    return (
        <Container>
            <ProblemDialog problem={undefined}/>
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
