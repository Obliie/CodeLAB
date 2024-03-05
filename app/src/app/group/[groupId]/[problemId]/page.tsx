import ProblemPage from '@/app/problem/[problemId]/page';
import SubmissionPage from '@/app/submission/[submissionId]/page';

const GroupProblemPage = ({ params }: { params: { problemId: string, groupId: string } }) => {
  return <ProblemPage params={{
        problemId: params.problemId,
        groupId: params.groupId
  }} />;
};

export default GroupProblemPage;