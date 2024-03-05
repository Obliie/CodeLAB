import ProblemEditPage from '@/app/problem/[problemId]/edit/page';
import ProblemPage from '@/app/problem/[problemId]/page';
import SubmissionPage from '@/app/submission/[submissionId]/page';

const GroupProblemEditPage = ({ params }: { params: { problemId: string, groupId: string } }) => {
  return <ProblemEditPage params={{
        problemId: params.problemId,
        groupId: params.groupId
  }} />;
};

export default ProblemEditPage;