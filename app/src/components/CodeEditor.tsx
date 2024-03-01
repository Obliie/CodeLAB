'use client';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import { Editor } from '@monaco-editor/react';
import { Typography } from '@mui/material';

function getEditorLanguage(language: ProgrammingLanguage) {
    switch (language) {
        case ProgrammingLanguage.PYTHON:
            return 'python';
        case ProgrammingLanguage.PROLOG:
            return 'plaintext';
    }
}

export default function CodeEditor({ code, setCode, language, readOnly }: { code: string | undefined, setCode: Function | undefined; language: ProgrammingLanguage, readOnly: boolean }) {
    return (
        <Editor
            height="70vh"
            defaultLanguage={getEditorLanguage(language)}
            defaultValue={code ? code : "# Your code here..."}
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
