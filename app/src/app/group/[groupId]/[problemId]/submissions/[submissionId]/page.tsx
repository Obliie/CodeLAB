import SubmissionPage from '@/app/submission/[submissionId]/page';

const ProblemSubmissionPage = ({ params }: { params: { groupId: string, problemId: string, submissionId: string } }) => {
  return <SubmissionPage params={{
        groupId: params.groupId,
        problemId: params.problemId,
        submissionId: params.submissionId
  }} />;
};

export default ProblemSubmissionPage;