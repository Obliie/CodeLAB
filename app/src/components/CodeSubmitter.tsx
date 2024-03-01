'use client';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import CodeEditor from './CodeEditor';
import CodeOutput from './CodeOutput';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useSession } from 'next-auth/react';

function getLanguageDisplayName(language: string) {
    switch (language) {
        case 'PROGRAMMING_LANGUAGE_PYTHON':
            return 'Python';
        case 'PROGRAMMING_LANGUAGE_PROLOG':
            return 'Prolog';
    }

    return '';
}

function getLanguage(language: string) {
    switch (language) {
        case 'PROGRAMMING_LANGUAGE_PYTHON':
            return ProgrammingLanguage.PYTHON;
        case 'PROGRAMMING_LANGUAGE_PROLOG':
            return ProgrammingLanguage.PROLOG;
    }

    return ProgrammingLanguage.UNSPECIFIED;
}

function LangageSelector({
    languages,
    curLanguage,
    setLanguage,
}: {
    languages: ProgrammingLanguage[];
    curLanguage: any;
    setLanguage: Function;
}) {
    const handleChange = (event: SelectChangeEvent) => {
        setLanguage(event.target.value);
    };

    return (
        <Box>
            <FormControl fullWidth sx={{ paddingTop: '5px', paddingBottom: '15px' }}>
                <Select label="Language" onChange={handleChange} defaultValue={curLanguage}>
                    {languages.map(language => (
                        <MenuItem value={language} key={language}>
                            {getLanguageDisplayName(language)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default function CodeSubmitter({ problem }: { problem: Problem }) {
    const { data: session } = useSession();
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState(problem.supportedLanguages[0]);

    return session ? (
        <Stack direction="column" spacing={2} width="100%">
            <Card sx={{ width: '100%', height: '75%' }}>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        Solution
                    </Typography>
                    {language ? (
                        <Box>
                            <LangageSelector
                                languages={problem.supportedLanguages}
                                curLanguage={language}
                                setLanguage={setLanguage}
                            />
                            <CodeEditor
                                code={undefined}
                                setCode={setCode}
                                language={getLanguage(language)}
                                readOnly={false}
                            />
                        </Box>
                    ) : (
                        <Typography>The problem author has not selected any supported languages...</Typography>
                    )}
                </CardContent>
            </Card>

            <CodeOutput code={code} language={getLanguage(language)} problem={problem} />
        </Stack>
    ) : (
        'You must be signed in to make a submission...'
    );
}
