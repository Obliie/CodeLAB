import { getProblems } from '@/lib/connect';
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

async function Problems() {
    const problems = await getProblems();

    return (
        <Box width="100%" paddingTop="10px">
            {problems.map((problem, index) => (
                <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{problem.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>{problem.description}</Typography>
                    </AccordionDetails>
                    <AccordionActions>
                        <Link href={`/problem/${index}`}>
                            <Button variant="contained">View {index}</Button>
                        </Link>
                    </AccordionActions>
                </Accordion>
            ))}
        </Box>
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
                    <Problems />
                </React.Suspense>
            </Box>
        </Container>
    );
}
