import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';

export default function UserSelectionField({
    selectedUsers,
    setSelectedUsers,
    setEdited,
}: {
    selectedUsers: string[];
    setSelectedUsers: Function;
    setEdited: Function
}) {
    const [importLoading, setImportLoading] = useState(false);
    const filter = createFilterOptions<string>();

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setImportLoading(true);
        const files = event.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                const reader = new FileReader();
                reader.onload = function (event) {
                    const fileContent = event.target.result as string;
                    const lines = fileContent.split(/\r?\n/);

                    setSelectedUsers([...selectedUsers, ...lines]);
                };

                reader.readAsText(file);
            }
        }

        setEdited(true);
        setImportLoading(false);
    };

    return (
        <Stack direction="row" spacing={2} sx={{ marginTop: '15px' }}>
            <Autocomplete
                value={selectedUsers}
                onChange={(event, newValue) => {
                    if (setEdited) {
                        setEdited(true);
                    }

                    setSelectedUsers([...newValue.filter(option => typeof option === 'string' || option.inputValue)]);
                }}
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);

                    const { inputValue } = params;
                    // Suggest the creation of a new value
                    const isExisting = options.some(option => inputValue === option);
                    if (inputValue !== '' && !isExisting) {
                        filtered.push(inputValue);
                    }

                    return filtered;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                fullWidth
                id="select-users"
                options={selectedUsers}
                getOptionLabel={option => {
                    // Value selected with enter, right from the input
                    if (typeof option === 'string') {
                        return option;
                    }
                    // Add "xxx" option created dynamically
                    if (option.inputValue) {
                        return option.inputValue;
                    }
                    // Regular option
                    return option;
                }}
                renderOption={(props, option, { selected }) => (
                    <li {...props}>
                        <Checkbox style={{ marginRight: 8 }} checked={selected} />
                        {option}
                    </li>
                )}
                freeSolo
                multiple
                renderInput={params => (
                    <TextField
                        {...params}
                        label="Members"
                        style={{
                            maxHeight: '150px',
                            overflowY: 'auto',
                        }}
                    />
                )}
            />
            {importLoading ? (
                <LoadingButton
                    loading
                    variant="outlined"
                    sx={{ paddingTop: '19px', paddingBottom: '19px', marginRight: '15px' }}></LoadingButton>
            ) : (
                <Tooltip
                    title={
                        'Import a user list, the file should be in plain text and users should be seperated by new lines'
                    }>
                    <Button variant="outlined" role={undefined} component="label" tabIndex={-1}>
                        <input
                            style={{ display: 'none' }}
                            type="file"
                            hidden
                            onChange={handleImport}
                            name="[problemMembers]"
                        />
                        Import
                    </Button>
                </Tooltip>
            )}
        </Stack>
    );
}
