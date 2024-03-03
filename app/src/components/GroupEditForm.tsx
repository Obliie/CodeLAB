"use client"
import { useClient, useServerClient } from "@/lib/connect";
import { handleGrpcError } from "@/lib/error";
import { ProgrammingLanguage } from "@/protobufs/common/v1/language_pb";
import { Problem, ProblemGroup, ProblemSummary } from "@/protobufs/common/v1/problem_pb";
import { ProblemService } from "@/protobufs/services/v1/problem_service_connect";
import { CreateProblemGroupResponse, UpdateProblemGroupResponse, UpdateProblemResponse } from "@/protobufs/services/v1/problem_service_pb";
import { CheckBox, CheckBoxOutlineBlank, Group } from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import MultiProblemSelect from "./MultiProblemSelect";
import LoadingButton from "@mui/lab/LoadingButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide, { SlideProps } from "@mui/material/Slide";
import SuccessSnackbar from "./SuccessSnackbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GroupEditForm({ group, problems, update, close }: { group: ProblemGroup | undefined, problems: ProblemSummary[], update: boolean, close: any }) {
    const [groupState, setGroupState] = useState({
        name: {
            value: group ? group.name : '',
            error: group ? false : true,
            errorMessage: 'You must provide a title'
        },
        description: {
            value: group ? group.description : '',
            error: group ? false : true,
            errorMessage: 'You must provide a description'
        },
    });
    const [selectedProblems, setSelectedProblems] = useState<ProblemSummary[]>(
        group ? problems.filter(problem => group?.problemIds.includes(problem.id)) : []
    );
    const { data: session } = useSession();
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitEnabled, setSubmitEnabled] = useState(false);
    const problemServiceClient = useClient(ProblemService);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async  () => {
        if (!session) {
            return;
        }
        
        setSubmitLoading(true);

        for (let key in groupState) {
            if (groupState[key].error) {
                setSubmitEnabled(false);
                setSubmitLoading(false);
                return;
            }
        }

        if (!group) {
            group = new ProblemGroup();
        }

        group.name = groupState.name.value;
        group.description = groupState.description.value;
        group.problemIds = selectedProblems.map(problem => problem.id);

        if (update) {
            const response = (await problemServiceClient
                .updateProblemGroup({
                    group: group,
                })
                .catch(err => handleGrpcError(err))) as UpdateProblemGroupResponse;
            
            setSubmitLoading(false);
            setOpen(true);
        } else {
            group.owner = session.user.id
            const response = await problemServiceClient.createProblemGroup({
                group: group
            })
            .catch(err => handleGrpcError(err)) as CreateProblemGroupResponse;
            
            setSubmitLoading(false);
            if (response.group) {
                router.push(`/group/${response.group.id}`)
            }
        }
    }

    const [edited, setEdited] = useState(false);
    const handleChange = (e: { target: { name: string; value: any } }) => {
        setEdited(true);

        const { name, value }: { name: string; value: any } = e.target;
        if (typeof value === 'string' && value === '') {
            setGroupState({
                ...groupState,
                [name]: {
                    ...groupState[name],
                    value,
                    error: true,
                },
            });
        } else {
            setGroupState({
                ...groupState,
                [name]: {
                    ...groupState[name],
                    value,
                    error: false,
                },
            });
        }
    };

    // Disable submit if a field has an active error
    useEffect(() => {
        if (!edited) return;

        var invalidField = false;
        for (let key in groupState) {
            if (groupState[key].error) {
                setSubmitEnabled(false);
                invalidField = true;
                break;
            }
        }

        if (!invalidField) {
            setSubmitEnabled(true);
        }
    }, [groupState, selectedProblems, edited]);

    return (
      <Box>
          <TextField
              margin="dense"
              id="name"
              name="name"
              label="Name"
              value={groupState.name.value}
              type="text"
              fullWidth
              onChange={handleChange}
              error={groupState.name.error}
              helperText={groupState.name.error && groupState.name.errorMessage}
          />
          <TextField
              margin="dense"
              id="description"
              name="description"
              label="Description"
              value={groupState.description.value}
              type="text"
              multiline
              fullWidth
              onChange={handleChange}
              error={groupState.description.error}
              helperText={groupState.description.error && groupState.description.errorMessage}
            />
            <MultiProblemSelect selectedProblems={selectedProblems} setEdited={setEdited} setSelectedProblems={setSelectedProblems} problems={problems} />
            <Box textAlign="end" paddingTop="20px" sx={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                {close !== undefined ? (
                    <Button type="button" variant="outlined" onClick={close}>
                        Close
                    </Button>
                ) : (
                    <></>
                )}
                {submitLoading ? 
                    (<LoadingButton loading variant="contained" size='medium' sx={{ paddingTop: '19px', paddingBottom: '19px' }}></LoadingButton>) :
                    (<Button type="submit" variant="contained" disabled={!submitEnabled} onClick={handleSubmit}>Save</Button>)
                }
            </Box>
            <SuccessSnackbar message="Group successfully updated!" open={open} setOpen={setOpen} />
      </Box>
    );
}
