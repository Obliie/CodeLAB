'use client';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import { Editor } from '@monaco-editor/react';

function getEditorLanguage(language: ProgrammingLanguage) {
    switch(language) {
        case ProgrammingLanguage.PYTHON:
            return "python"
        case ProgrammingLanguage.PROLOG:
            return "plaintext"
    }
}

export default function CodeEditor({ setCode, language }: { setCode: Function, language: ProgrammingLanguage }) {
    return (
        <Editor
            height="70vh"
            defaultLanguage={getEditorLanguage(language)}
            defaultValue="# Your code here..."
            theme="vs-dark"
            options={{
                minimap: {
                    enabled: false
                }
            }}
            onChange={(value, _) => {
                if (value) {
                    setCode(value);
                }
            }}
        />
    );
}
