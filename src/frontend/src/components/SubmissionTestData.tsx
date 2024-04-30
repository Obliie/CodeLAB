'use client';
import { Problem_TestData, Problem_TestFile } from '@/protobufs/common/v1/problem_pb';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import React from 'react';
import { SubmissionTestResult } from '@/protobufs/services/v1/submission_service_pb';
import Chip from '@mui/material/Chip';

export default function SubmissionTestData({ testData }: { testData: SubmissionTestResult[] }) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        testData.length > 0 ? 
        <Box sx={{ flexGrow: 1, display: 'flex', height: '92%', width: '100%', marginBottom: '16px' }}>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="test data"
                sx={{ borderRight: 1, borderColor: 'divider' }}>
                {testData.map((data, i) => (
                    <Tab key={i} label={`Test ${i + 1} | ${data.passed ? "✔" : "✖"}`} {...a11yProps(i)} />
                ))}
            </Tabs>
            {testData.map((data, i) => (
                <SubmissionTestDataTab key={i} testData={data} value={value} index={i} />
            ))}
        </Box> : "No test results..."
    );
}

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

function SubmissionTestDataTab({ testData, value, index }: { testData: SubmissionTestResult; value: number; index: number }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}>
            {value === index && (
                <Box sx={{ p: 3, width: '100%' }}>
                    <Box sx={{ marginBottom: '16px' }}>
                        <Typography variant="h6">Passed</Typography>
                        {testData.passed ? <Chip label="pass" color="success" variant="outlined" /> : <Chip label="fail" color="error" variant="outlined" />}
                    </Box>
                    <Box sx={{ marginBottom: '16px' }}>
                        <Typography variant="h6">Output</Typography>
                        <Box sx={{ whiteSpace: "pre-wrap" }}>{testData.output}</Box>
                    </Box>
                    <Box sx={{ marginBottom: '16px' }}>
                        <Typography variant="h6">Runtime</Typography>
                        <Typography>{`${testData.runtime.toFixed(3)}s`}</Typography>
                    </Box>
                </Box>
            )}
        </div>
    );
}
