'use client';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import { Editor } from '@monaco-editor/react';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';

function getEditorLanguage(language: ProgrammingLanguage) {
    switch (language) {
        case ProgrammingLanguage.PYTHON:
            return 'python';
        case ProgrammingLanguage.JAVA:
            return 'java';
        case ProgrammingLanguage.JAVASCRIPT:
            return 'javascript'
        case ProgrammingLanguage.C:
            return 'c'
        case ProgrammingLanguage.PROLOG:
            return 'plaintext';
    }
}

function getLanguage(language: string) {
    switch (language) {
        case 'PROGRAMMING_LANGUAGE_PYTHON':
            return ProgrammingLanguage.PYTHON;
        case 'PROGRAMMING_LANGUAGE_JAVASCRIPT':
            return ProgrammingLanguage.JAVASCRIPT;
        case 'PROGRAMMING_LANGUAGE_JAVA':
            return ProgrammingLanguage.JAVA;
        case 'PROGRAMMING_LANGUAGE_C':
            return ProgrammingLanguage.C;
        case 'PROGRAMMING_LANGUAGE_PROLOG':
            return ProgrammingLanguage.PROLOG;
    }

    return ProgrammingLanguage.UNSPECIFIED;
}

export default function CodeEditor({ code, setCode, langEnum, language, readOnly }: { code: string | undefined, setCode: Function | undefined, langEnum: ProgrammingLanguage | undefined, language: string | undefined, readOnly: boolean }) {
    const [defLang, setDefLang] = useState(langEnum ? getEditorLanguage(langEnum) : getEditorLanguage(getLanguage(language ?? "")));

    useEffect(() => {
        setDefLang(getEditorLanguage(getLanguage(language ?? "")));
    }, [language])

    return (
        <Editor
            height="50vh"
            defaultLanguage={defLang}
            value={code}
            theme="vs-dark"
            options={{
                minimap: {
                    enabled: false,
                },
                readOnly: readOnly
            }}
            onChange={(value, _) => {
                if (setCode && value) {
                    setCode(value);
                }
            }}
        /> 
    );
}
