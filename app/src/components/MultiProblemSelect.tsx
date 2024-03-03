'use client';
import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemSummary } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { GetProblemSummariesResponse } from '@/protobufs/services/v1/problem_service_pb';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

export default function MultiProblemSelect({
    selectedProblems,
    setSelectedProblems,
    problems,
    setEdited,
}: {
    selectedProblems: ProblemSummary[];
    setSelectedProblems: Function;
    problems: ProblemSummary[];
    setEdited: Function
}) {
    return problems ? (
        <Autocomplete
            fullWidth
            multiple
            id="problems"
            options={problems}
            disableCloseOnSelect
            getOptionLabel={option => option.title}
            renderOption={(props, option, { selected }) => (
                <li {...props} key={option.id}>
                    <Checkbox
                        key={option.id}
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                    />
                    {option.title}
                </li>
            )}
            renderInput={params => <TextField {...params} label="Problems" />}
            sx={{ paddingTop: '8px' }}
            value={selectedProblems}
            onChange={(event, newValue, reason) => {
                if (
                    event.type === 'keydown' &&
                    ((event as React.KeyboardEvent).key === 'Backspace' ||
                        (event as React.KeyboardEvent).key === 'Delete') &&
                    reason === 'removeOption'
                ) {
                    return;
                }

                if (setEdited) {
                    setEdited(true);
                }

                setSelectedProblems(newValue);
            }}
        />
    ) : (
        <></>
    );
}
