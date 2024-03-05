import ProblemSubmissionsPage from '@/app/problem/[problemId]/submissions/page';

const GroupProblemSubmissionsPage = ({ params }: { params: { groupId: string; problemId: string } }) => {
    return (
        <ProblemSubmissionsPage
            params={{
                groupId: params.groupId,
                problemId: params.problemId,
            }}
        />
    );
};

export default GroupProblemSubmissionsPage;
