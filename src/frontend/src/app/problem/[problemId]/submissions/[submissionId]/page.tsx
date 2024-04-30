import SubmissionPage from '@/app/submission/[submissionId]/page';

const ProblemSubmissionPage = ({ params }: { params: { problemId: string, submissionId: string } }) => {
  return <SubmissionPage params={{
        problemId: params.problemId,
        submissionId: params.submissionId
  }} />;
};

export default ProblemSubmissionPage;