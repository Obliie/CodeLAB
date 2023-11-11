"""Integration tests for the problem service."""
import os

import grpc
from protobufs.common.v1 import problem_pb2
from protobufs.services.v1 import problem_service_pb2, problem_service_pb2_grpc

### TODO Update tests to use MongoMock

def test_get_problem() -> None:
    with grpc.insecure_channel(f"problem:{ os.environ['PROBLEM_SERVICE_PORT' ]}") as channel:
        stub = problem_service_pb2_grpc.ProblemServiceStub(channel)

        response = stub.GetProblem(problem_service_pb2.GetProblemRequest(problem_id="654fd205349d0c3f39bbd86c"))

        assert response.problem.title == "Programming Lab Environment"

def test_get_problem_summaries() -> None:
    with grpc.insecure_channel(f"problem:{ os.environ['PROBLEM_SERVICE_PORT' ]}") as channel:
        stub = problem_service_pb2_grpc.ProblemServiceStub(channel)

        response = stub.GetProblemSummaries(problem_service_pb2.GetProblemSummariesRequest(limit=100))

        assert len(response.problem_summaries) > 0

def test_create_problem() -> None:
    with grpc.insecure_channel(f"problem:{ os.environ['PROBLEM_SERVICE_PORT' ]}") as channel:
        stub = problem_service_pb2_grpc.ProblemServiceStub(channel)

        problem = problem_pb2.Problem()
        problem.title = "Programming Lab Environment"
        problem.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Varius duis at consectetur lorem donec. In ante metus dictum at tempor commodo ullamcorper a. Nulla facilisi etiam dignissim diam quis enim lobortis. Sapien eget mi proin sed libero. In pellentesque massa placerat duis ultricies lacus. Semper viverra nam libero justo laoreet sit amet cursus. Fames ac turpis egestas sed tempus. Vitae semper quis lectus nulla at volutpat diam ut venenatis. Urna nunc id cursus metus aliquam. Aliquet eget sit amet tellus cras adipiscing enim. Sit amet nisl suscipit adipiscing bibendum est ultricies. Odio facilisis mauris sit amet massa vitae tortor condimentum. Dictumst quisque sagittis purus sit amet volutpat consequat mauris. Diam maecenas ultricies mi eget mauris pharetra et ultrices neque. \n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Varius duis at consectetur lorem donec. In ante metus dictum at tempor commodo ullamcorper a. Nulla facilisi etiam dignissim diam quis enim lobortis. Sapien eget mi proin sed libero. In pellentesque massa placerat duis ultricies lacus. Semper viverra nam libero justo laoreet sit amet cursus. Fames ac turpis egestas sed tempus. Vitae semper quis lectus nulla at volutpat diam ut venenatis. Urna nunc id cursus metus aliquam. Aliquet eget sit amet tellus cras adipiscing enim. Sit amet nisl suscipit adipiscing bibendum est ultricies. Odio facilisis mauris sit amet massa vitae tortor condimentum. Dictumst quisque sagittis purus sit amet volutpat consequat mauris. Diam maecenas ultricies mi eget mauris pharetra et ultrices neque."

        testData1 = problem_pb2.Problem.TestData()
        testData1.arguments = "-L python"
        testData1.expected_stdout = "Hello python!"

        testData2 = problem_pb2.Problem.TestData()
        testData2.arguments = "-L c++"
        testData2.expected_stdout = "Hello c++!"

        problem.tests.append(testData1)
        problem.tests.append(testData2)

        response = stub.CreateProblem(problem_service_pb2.CreateProblemRequest(problem=problem))

        assert response.problem.id is not None


def test_update_problem() -> None:
    with grpc.insecure_channel(f"problem:{ os.environ['PROBLEM_SERVICE_PORT' ]}") as channel:
        stub = problem_service_pb2_grpc.ProblemServiceStub(channel)

        problem = problem_pb2.Problem()
        problem.id = '654fd205349d0c3f39bbd86c'
        problem.title = "CodeLAB :)"
        problem.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Varius duis at consectetur lorem donec. In ante metus dictum at tempor commodo ullamcorper a. Nulla facilisi etiam dignissim diam quis enim lobortis. Sapien eget mi proin sed libero. In pellentesque massa placerat duis ultricies lacus. Semper viverra nam libero justo laoreet sit amet cursus. Fames ac turpis egestas sed tempus. Vitae semper quis lectus nulla at volutpat diam ut venenatis. Urna nunc id cursus metus aliquam. Aliquet eget sit amet tellus cras adipiscing enim. Sit amet nisl suscipit adipiscing bibendum est ultricies. Odio facilisis mauris sit amet massa vitae tortor condimentum. Dictumst quisque sagittis purus sit amet volutpat consequat mauris. Diam maecenas ultricies mi eget mauris pharetra et ultrices neque. \n\n Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Varius duis at consectetur lorem donec. In ante metus dictum at tempor commodo ullamcorper a. Nulla facilisi etiam dignissim diam quis enim lobortis. Sapien eget mi proin sed libero. In pellentesque massa placerat duis ultricies lacus. Semper viverra nam libero justo laoreet sit amet cursus. Fames ac turpis egestas sed tempus. Vitae semper quis lectus nulla at volutpat diam ut venenatis. Urna nunc id cursus metus aliquam. Aliquet eget sit amet tellus cras adipiscing enim. Sit amet nisl suscipit adipiscing bibendum est ultricies. Odio facilisis mauris sit amet massa vitae tortor condimentum. Dictumst quisque sagittis purus sit amet volutpat consequat mauris. Diam maecenas ultricies mi eget mauris pharetra et ultrices neque."

        testData1 = problem_pb2.Problem.TestData()
        testData1.arguments = "-L java"
        testData1.expected_stdout = "Hello python!"

        testData2 = problem_pb2.Problem.TestData()
        testData2.arguments = "-L c++"
        testData2.expected_stdout = "Hello c++!"

        problem.tests.append(testData1)
        problem.tests.append(testData2)

        response = stub.UpdateProblem(problem_service_pb2.UpdateProblemRequest(problem=problem))

        assert response.success is True


def test_delete_problem() -> None:
    with grpc.insecure_channel(f"problem:{ os.environ['PROBLEM_SERVICE_PORT' ]}") as channel:
        stub = problem_service_pb2_grpc.ProblemServiceStub(channel)

        response = stub.DeleteProblem(problem_service_pb2.DeleteProblemRequest(problem_id='654fd205349d0c3f39bbd86c'))

        assert response.success is True

def test_add_test_data_to_problem() -> None:
    with grpc.insecure_channel(f"problem:{ os.environ['PROBLEM_SERVICE_PORT' ]}") as channel:
        stub = problem_service_pb2_grpc.ProblemServiceStub(channel)

        request = problem_service_pb2.AddTestDataRequest()
        request.problem_id = '654fe985989511f7a4359d06'

        testData1 = problem_pb2.Problem.TestData()
        testData1.arguments = "late added"
        testData1.expected_stdout = "Hello dd!"
        request.tests.append(testData1)

        testData2 = problem_pb2.Problem.TestData()
        testData2.arguments = "dddddddddd"
        testData2.expected_stdout = "Hello c+d+!"
        request.tests.append(testData2)

        response = stub.AddTestData(request)

        assert response.success is True