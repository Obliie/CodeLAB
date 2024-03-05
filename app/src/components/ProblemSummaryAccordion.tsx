"use client"
import { ProblemSummary } from "@/protobufs/common/v1/problem_pb";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ProblemActions from "./ProblemActions";
import { DeleteProblemRequest } from "@/actions/DeleteProblemRequest";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useState } from "react";

export default function ProblemSummaryAccordion({ problemSummaries, deleteProblem, nav }: { deleteProblem: Function, problemSummaries: ProblemSummary[], nav: string }) {
    const { data: session } = useSession();
    const [filteredSummaries, setFilteredSummaries] = useState(problemSummaries)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilteredSummaries([...problemSummaries.filter(summary => summary.title.toLowerCase().includes(event.target.value.toLowerCase()))])
    }

    return (
    <Box>
        <TextField fullWidth id="problem-filter" label="Search..." variant="outlined" size="small" onChange={handleChange} sx={{ paddingBottom: '10px' }} />
        {filteredSummaries.map(problem => (
            <Accordion key={problem.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>{problem.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>{problem.summary}</Typography>
                </AccordionDetails>
                <AccordionActions sx={{marginBottom: '10px', gap: '5px', marginRight: '10px'}}>
                    <ProblemActions problemId={problem.id} deleteAction={deleteProblem} nav={nav} isOwner={session ? (session?.user.email === problem.owner) : false}/>
                </AccordionActions>
            </Accordion>
        ))}</Box>
    );
}