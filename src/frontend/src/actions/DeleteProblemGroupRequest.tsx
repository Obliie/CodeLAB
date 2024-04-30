import { useServerClient } from '@/lib/connect';
import { handleGrpcError } from '@/lib/error';
import { ProblemService } from '@/protobufs/services/v1/problem_service_connect';
import { DeleteProblemGroupResponse } from '@/protobufs/services/v1/problem_service_pb';

export async function DeleteProblemGroupRequest({ groupId }: { groupId: string }) {
    'use server';
    const response = (await useServerClient(ProblemService)
        .deleteProblemGroup({
            groupId: groupId
        })
        .catch(err => handleGrpcError(err))) as DeleteProblemGroupResponse;

    return response;
}