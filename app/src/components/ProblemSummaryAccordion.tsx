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
import { useClient } from "@/lib/connect";
import { SubmissionService } from "@/protobufs/services/v1/submission_service_connect";
import { handleGrpcError } from "@/lib/error";
import { GetSubmissionStateForUserResponse } from "@/protobufs/services/v1/submission_service_pb";
import Chip from "@mui/material/Chip";
import { PromiseClient } from "@connectrpc/connect";

export default function ProblemSummaryAccordion({ problemSummaries, deleteProblem, nav }: { deleteProblem: Function, problemSummaries: ProblemSummary[], nav: string }) {
    const { data: session } = useSession();
    const [filteredSummaries, setFilteredSummaries] = useState(problemSummaries);
    const submissionServiceClient: PromiseClient<typeof SubmissionService> = useClient(SubmissionService);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilteredSummaries([...problemSummaries.filter(summary => summary.title.toLowerCase().includes(event.target.value.toLowerCase()))])
    }

    return (
    <Box>
        <TextField fullWidth id="problem-filter" label="Search..." variant="outlined" size="small" onChange={handleChange} sx={{ paddingBottom: '10px' }} />
        {filteredSummaries.map(async (problem) => {
            const response = session ? (await submissionServiceClient
                .getSubmissionStateForUser({
                    problemId: problem.id,
                    userId: session?.user.email ?? ""
                })
                .catch(err => handleGrpcError(err))) as GetSubmissionStateForUserResponse : undefined;

            var chip;
            if (response) {
                if (response.state == 2 && response.testPassed == response.testTotal) {
                    chip = <Chip label={`Submitted | ${response.testPassed}/${response.testTotal} Tests Passing`} color="success" variant="outlined" size="small" />
                } else if (response.state == 2) {
                    chip = <Chip label={`Submitted | ${response.testPassed}/${response.testTotal} Tests Passing`} color="error" variant="outlined" size="small" />
                } else if (response.state == 1) {
                    chip = <Chip label={`In Progress`} color="warning" variant="outlined" size="small" />
                }
            }
            
            return (
            <Accordion key={problem.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        paddingRight: '12px'
                    }}>
                        <Typography>{problem.title}</Typography>
                        {chip ? chip : <></>}
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>{problem.summary}</Typography>
                </AccordionDetails>
                <AccordionActions sx={{marginBottom: '10px', gap: '5px', marginRight: '10px'}}>
                    <ProblemActions hideView={false} problemId={problem.id} deleteAction={deleteProblem} nav={nav} isOwner={session ? (session?.user.email === problem.owner) : false}/>
                </AccordionActions>
            </Accordion>
        )})}</Box>
    );
}