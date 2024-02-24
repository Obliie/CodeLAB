import { useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { Problem } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { UpdateProblemResponse } from '@/protobufs/services/v1/problem_service_pb';

export async function UpdateProblemRequest({ problem }: { problem: Problem }) {
    'use server';

    const response = (await useServerClient(ProblemService)
        .updateProblem({
            problem: problem
        })
        .catch(err => handleGrpcError(err))) as UpdateProblemResponse;

    return response;
}