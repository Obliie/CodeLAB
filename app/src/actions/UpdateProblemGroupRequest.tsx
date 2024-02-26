import { useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { Problem, ProblemGroup } from '@/protobufs/common/v1/problem_pb';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { UpdateProblemGroupResponse, UpdateProblemResponse } from '@/protobufs/services/v1/problem_service_pb';

export async function UpdateProblemGroupRequest({ group }: { group: ProblemGroup }) {
    'use server';

    const response = (await useServerClient(ProblemService)
        .updateProblemGroup({
            group: group
        })
        .catch(err => handleGrpcError(err))) as UpdateProblemGroupResponse;

    return response;
}