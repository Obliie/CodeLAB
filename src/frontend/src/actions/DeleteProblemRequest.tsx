import { useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { DeleteProblemResponse } from '@/protobufs/services/v1/problem_service_pb';

export async function DeleteProblemRequest({ problemId }: { problemId: string }) {
    'use server';
    const response = (await useServerClient(ProblemService)
        .deleteProblem({
            problemId: problemId
        })
        .catch(err => handleGrpcError(err))) as DeleteProblemResponse;

    return response;
}