"use client"
import { Editor } from '@monaco-editor/react';
import { Dispatch, SetStateAction } from 'react';

export default function CodeEditor({ setCode }: {setCode: Function}) {
    return <Editor height="90vh" defaultLanguage="python" defaultValue="# Your code here..." theme='vs-dark' onChange={(value, _) => { if (value) {setCode(value)} }}/>;
}
