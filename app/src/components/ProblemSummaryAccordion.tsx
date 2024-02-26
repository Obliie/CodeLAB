import { ProblemSummary } from "@/protobufs/common/v1/problem_pb";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ProblemActions from "./ProblemActions";
import { DeleteProblemRequest } from "@/actions/DeleteProblemRequest";
import ExpandMore from "@mui/icons-material/ExpandMore";

export default function ProblemSummaryAccordion({ problemSummaries }: { problemSummaries: ProblemSummary[] }) {
    return (problemSummaries.map(problem => (
        <Accordion key={problem.id}>
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{problem.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>{problem.summary}</Typography>
            </AccordionDetails>
            <AccordionActions>
                <ProblemActions problemId={problem.id} deleteAction={DeleteProblemRequest}/>
            </AccordionActions>
        </Accordion>
    )));
}