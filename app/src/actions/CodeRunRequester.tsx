import { useClient, useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProgrammingLanguage } from '@/protobufs/common/v1/language_pb';
import { SolutionFile, SolutionFileType } from '@/protobufs/common/v1/solution_pb';
import { CodeRunnerService } from '@/protobufs/services/v1/code_runner_service_connect';
import { RunCodeResponse } from '@/protobufs/services/v1/code_runner_service_pb';

export async function CodeRunRequester({ code }: { code: string }) {
    'use server';
    const mainFile: SolutionFile = new SolutionFile();
    mainFile.type = SolutionFileType.FILE_TYPE_SINGLE;
    mainFile.mainFile = true;
    mainFile.path = 'main.py';

    const encoder = new TextEncoder();
    mainFile.data = encoder.encode(code);

    const runOutput = (await useServerClient(CodeRunnerService)
        .runCode({
            files: [mainFile],
            language: ProgrammingLanguage.PYTHON,
            hasDependencies: false,
        })
        .catch(err => handleGrpcError(err))) as RunCodeResponse;

    return runOutput;
}
