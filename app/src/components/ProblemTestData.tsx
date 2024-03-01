'use client';
import { Problem_TestData, Problem_TestFile } from '@/protobufs/common/v1/problem_pb';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import React from 'react';
import TestDataDialog from './TestDataDialog';

export default function ProblemTestData({ testData }: { testData: Problem_TestData[] }) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', height: '92%', width: '100%', marginBottom: '16px' }}>
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={value}
                onChange={handleChange}
                aria-label="test data"
                sx={{ borderRight: 1, borderColor: 'divider' }}>
                {testData.map((data, i) => (
                    <Tab key={i} label={`Test ${i + 1}`} {...a11yProps(i)} />
                ))}
            </Tabs>
            {testData.length > 0 ? testData.map((data, i) => (
                <TestDataTab key={i} testData={data} value={value} index={i} />
            )) : "No tests..."}
        </Box>
    );
}

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

function TestDataTab({ testData, value, index }: { testData: Problem_TestData; value: number; index: number }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}>
            {value === index && (
                <Box sx={{ p: 3, width: '100%' }}>
                    <Box sx={{ marginBottom: '16px' }}>
                        <Typography variant="h6">Arguments</Typography>
                        <Typography>{testData.arguments}</Typography>
                    </Box>
                    <Box sx={{ marginBottom: '16px' }}>
                        <Typography variant="h6">Expected Output</Typography>
                        <Typography>{testData.expectedStdout}</Typography>
                    </Box>
                    {testData.expectedFiles.length > 0 ? (
                        <Box>
                            <Typography variant="h6">Expected Files</Typography>
                            <Typography>{testData.expectedFiles.length}</Typography>
                        </Box>
                    ) : (
                        <></>
                    )}
                </Box>
            )}
        </div>
    );
}
