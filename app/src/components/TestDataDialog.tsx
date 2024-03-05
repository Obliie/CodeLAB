'use client';
import { useClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { Problem, Problem_TestData } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { AddTestDataResponse, CreateProblemResponse } from '@/protobufs/services/v1/problem_service_pb';
import styled from '@emotion/styled';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Tooltip, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import SuccessSnackbar from './SuccessSnackbar';
import JSZip from 'jszip';

export default function TestDataDialog({
    testData,
    problem_id,
    handleDelete,
}: {
    testData: Problem_TestData | undefined;
    problem_id: string;
    handleDelete: React.MouseEventHandler | undefined;
}) {
    const [open, setOpen] = React.useState(false);
    const [args, setArgs] = React.useState('');
    const [expectedStdout, setExpectedStdout] = React.useState('');
    const [stdin, setStdin] = React.useState('');
    const problemServiceClient = useClient(ProblemService);
    const [importLoading, setImportLoading] = React.useState(false);
    const router = useRouter();
    const [openImport, setOpenImport] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async () => {
        uploadProblemTest(args, expectedStdout, stdin);

        router.refresh();
        setOpen(false);
    };

    const uploadProblemTest = async (args: string, expectedStdout: string, stdin: string) => {
        const testData = new Problem_TestData();
        testData.arguments = args;
        testData.expectedStdout = expectedStdout;
        testData.stdin = stdin;

        (await problemServiceClient
            .addTestData({
                problemId: problem_id,
                tests: [testData],
            })
            .catch(err => handleGrpcError(err))) as AddTestDataResponse;
    }

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setImportLoading(true);
        const loadedTests: Record<string, { in?: string, out?: string }> = {};
        const files = event.target.files;
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
    
                // Ensure the file is a ZIP file
                if (file.name.endsWith('.zip')) {
                    try {
                        const zip = new JSZip();
                        // Read the ZIP file
                        const content = await zip.loadAsync(file);
                        
                        // Iterate over all files in the ZIP
                        await Promise.all(Object.keys(content.files).map(async (filename) => {
                            if (filename.endsWith('.in') || filename.endsWith('.out')) {
                                const fileData = content.files[filename];
                                // Ensure it's not a directory
                                if (!fileData.dir) {
                                    const fileContent = await fileData.async('string');
                                    const name = filename.split('.').slice(0, -1).join('.');
                                    const fileType = filename.split('.').pop(); // 'in' or 'out'
                                    
                                    if (!loadedTests[name]) {
                                        loadedTests[name] = {};
                                    }
    
                                    if (fileType) {
                                        loadedTests[name][fileType] = fileContent;
                                    }
                                }
                            }
                        }));
                    } catch (error) {
                        console.error('Error processing ZIP file:', error);
                        setImportLoading(false);
                        return;
                    }
                }
            }
        }

        for (const [key, value] of Object.entries(loadedTests)) {
            if (value.in && value.out) {
                await uploadProblemTest('', value.out, value.in);
            } else {
                console.warn(`Incomplete test data for ${key}, skipping upload.`);
            }
        }
    
        router.refresh();
        setImportLoading(false);
        setOpenImport(true);
    };

    return (
        <React.Fragment>
            <Box textAlign="end" paddingTop="20px">
                <Button variant="outlined" color="error" onClick={handleDelete} sx={{ marginRight: '15px' }}>
                    Delete Test Data
                </Button>
                {importLoading ? 
                    (<LoadingButton loading variant="contained" size='medium' sx={{ paddingTop: '19px', paddingBottom: '19px', marginRight: '15px' }}></LoadingButton>) :
                    (<Tooltip title={'Import data should be contained in a .ZIP file which contains test data in ICPC format. A test should have two associated files within the ZIP, <test name>.in and <test name>.out, each corresponding to a tests stdin and expected stdout respectively.'}>
                    <Button 
                        variant="contained"
                        sx={{ marginRight: '15px' }}
                        role={undefined}
                        component="label"
                        tabIndex={-1}
                    >
                        <input
                            style={{display:"none"}}
                            type="file"
                            hidden
                            onChange={handleImport}
                            name="[icpcTests]"
                        />
                        Import Test Data (ICPC)
                    </Button>
                </Tooltip>)
                }
                <Button variant="contained" onClick={handleClickOpen}>
                    Create Test Data
                </Button>
                <SuccessSnackbar message="Successfully uploaded test data!" open={openImport} setOpen={setOpenImport}/>
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Test Data</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="arguments"
                        label="Command Line Arguments"
                        type="text"
                        fullWidth
                        variant="standard"
                        onChange={event => {
                            setArgs(event.target.value);
                        }}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="stdin"
                        label="Stdin"
                        type="text"
                        multiline
                        fullWidth
                        variant="standard"
                        onChange={event => {
                            setStdin(event.target.value);
                        }}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="expected-stdout"
                        label="Expected Stdout"
                        type="text"
                        multiline
                        fullWidth
                        variant="standard"
                        onChange={event => {
                            setExpectedStdout(event.target.value);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
