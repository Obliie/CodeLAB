'use client';
import { Problem_TestData, Problem_TestFile, Problem_TestInput } from '@/protobufs/common/v1/problem_pb';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function ProblemTestData({ testData }: { testData: Problem_TestData[] }) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ flexGrow: 1, display: 'flex', height: '100%', width: '100%' }}>
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
            {testData.map((data, i) => (
                <TestDataTab key={i} testData={data} value={value} index={i} />
            ))}
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
                    <TestInputs inputs={testData.inputs} />
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

function TestInputs({ inputs }: { inputs: Problem_TestInput[] }) {
    var text = 'app.py ';
    inputs.map(input => {
        if (input instanceof Problem_TestFile) {
            text += ` ${input.path}`;
        } else {
            text += ` ${input.inputValue}`;
        }
    });

    return (
        <Box sx={{ marginBottom: '16px' }}>
            <Typography variant="h6">Arguments</Typography>
            <Typography>{text}</Typography>
        </Box>
    );
}
