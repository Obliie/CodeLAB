"""A service to handle the persistence of "problems" and their submitted solutions with any evaluated scores."""
from concurrent import futures
import logging
import os
import time
from typing import Any, Dict

import grpc
from google.protobuf import json_format
from bson.objectid import ObjectId
from protobufs.services.v1 import problem_service_pb2, problem_service_pb2_grpc
from protobufs.common.v1 import problem_pb2

from common.service_logging import init_logging, log_and_flush
from common.jwt import decrypt_jwt
from pymongo import MongoClient

DATABASE_NAME = "problems"

PROTOBUF_PROBLEM_ID_FIELD = "id"
PROTOBUF_GROUP_ID_FIELD = "id"

PROBLEMS_COLLECTION_NAME = "problems"
PROBLEM_ID_FIELD = "_id"
PROBLEM_TITLE_FIELD = "title"
PROBLEM_DESCRIPTION_FIELD = "description"
PROBLEM_TESTS_FIELD = "tests"
PROBLEM_OWNER_FIELD = "owner"
PROBLEM_MEMBERS_FIELD = "members"

PROBLEM_GROUPS_COLLECTION_NAME = "groups"
GROUP_ID_FIELD = "_id"
GROUP_NAME_FIELD = "name"
GROUP_PROBLEMS_FIELD = "problems"
GROUP_OWNER_FIELD = "owner"
GROUP_MEMBER_FIELD = "members"

PROBLEM_SUMMARY_LENGTH = 250


class ProblemServicer(problem_service_pb2_grpc.ProblemService):
    def __init__(self):
        self.client = MongoClient(
            os.environ['PROBLEMDB_CONN']
        )
        log_and_flush(logging.INFO, f"MongoDB client created...")

    def _problem_document_to_problem_summary(
        self, problem: Dict[Any, Any]
    ) -> problem_pb2.ProblemSummary:
        summary = problem_pb2.ProblemSummary()
        summary.id = str(problem[PROBLEM_ID_FIELD])
        summary.owner = problem[PROBLEM_OWNER_FIELD]
        if PROBLEM_MEMBERS_FIELD in problem:
            for member in problem[PROBLEM_MEMBERS_FIELD]:
                summary.members.append(member)

        if PROBLEM_TITLE_FIELD in problem:
            summary.title = problem[PROBLEM_TITLE_FIELD]
        else:
            summary.title = "Untitled problem."
        
        if PROBLEM_DESCRIPTION_FIELD in problem:
            summary.summary = (
                (f"{problem[PROBLEM_DESCRIPTION_FIELD][:PROBLEM_SUMMARY_LENGTH]}...")
                if len(problem[PROBLEM_DESCRIPTION_FIELD]) > PROBLEM_SUMMARY_LENGTH
                else problem[PROBLEM_DESCRIPTION_FIELD]
            )
        else:
            summary.summary = "No description."

        return summary

    def _query_id(self, problem_id: str) -> ObjectId:
        return ObjectId(problem_id)

    def GetProblemSummaries(
        self,
        request: problem_service_pb2.GetProblemSummariesRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.GetProblemSummariesResponse:
        if request.id_filter:
            problem_ids = [self._query_id(id_str) for id_str in request.id_filter]
            problems = (
                self.client[DATABASE_NAME]
                .get_collection(PROBLEMS_COLLECTION_NAME)
                .find({"_id": {"$in": problem_ids}})
                .limit(request.limit)
            )
        else:
            problems = (
                self.client[DATABASE_NAME]
                .get_collection(PROBLEMS_COLLECTION_NAME)
                .find({})
                .limit(request.limit)
            )

        resp = problem_service_pb2.GetProblemSummariesResponse()
        for problem in problems:
            if not request.id_filter:
                if ('public' not in problem or not problem['public']) and ('members' not in problem or request.user_id not in problem['members']):
                    continue

            summary = self._problem_document_to_problem_summary(problem)
            resp.problem_summaries.append(summary)

        return resp

    def _problem_document_to_problem(
        self, problem_document: Dict[Any, Any]
    ) -> problem_pb2.Problem:
        problem_document[PROTOBUF_PROBLEM_ID_FIELD] = str(
            problem_document.pop(PROBLEM_ID_FIELD)
        )

        problem = problem_pb2.Problem()
        json_format.ParseDict(problem_document, problem)

        return problem

    def GetProblem(
        self,
        request: problem_service_pb2.GetProblemRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.GetProblemResponse:
        problem_document = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEMS_COLLECTION_NAME)
            .find_one({PROBLEM_ID_FIELD: self._query_id(request.problem_id)})
        )

        resp = problem_service_pb2.GetProblemResponse()
        if problem_document:
            resp.problem.CopyFrom(self._problem_document_to_problem(problem_document))

        return resp

    def CreateProblem(
        self,
        request: problem_service_pb2.CreateProblemRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.CreateProblemResponse:
        result = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEMS_COLLECTION_NAME)
            .insert_one(json_format.MessageToDict(request.problem))
        )
        request.problem.id = str(result.inserted_id)

        resp = problem_service_pb2.CreateProblemResponse()
        resp.problem.CopyFrom(request.problem)
        resp.success = result.acknowledged

        return resp
    
    def UpdateProblem(
        self,
        request: problem_service_pb2.UpdateProblemRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.UpdateProblemResponse:
        problem_dict = json_format.MessageToDict(request.problem)

        # Artificial slowdown for frontend astethics
        time.sleep(1)

        # TODO Validate JWT Token
        #metadata = dict(context.invocation_metadata())
        #token = metadata.get('authorization', [b''])
        #dtoken = decrypt_jwt(token)
        #log_and_flush(logging.INFO, f"Token: {token}")
        #log_and_flush(logging.INFO, f"Dec Token: {dtoken}")
        # Validate the token
        """    try:
            decoded_token = jwt.decode(token, 'secret-key', algorithms=['HS256'])
            # Process the decoded token as needed
            user_id = decoded_token['user_id']
            # Perform other logic...
        except jwt.ExpiredSignatureError:
            # Handle token expiration
            pass
        except jwt.InvalidTokenError:
            # Handle invalid token
            pass"""

        if ('displayTestData' not in problem_dict):
            problem_dict['displayTestData'] = False

        if ('public' not in problem_dict):
            problem_dict['public'] = False

        if ('members' in problem_dict):
            problem_dict['members'] = [item for item in problem_dict['members'] if item != ""]

        result = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEMS_COLLECTION_NAME)
            .update_one(
                {
                    PROBLEM_ID_FIELD: self._query_id(
                        problem_dict.pop(PROTOBUF_PROBLEM_ID_FIELD)
                    )
                },
                {"$set": problem_dict},
            )
        )

        resp = problem_service_pb2.UpdateProblemResponse()
        resp.success = result.acknowledged

        return resp

    def DeleteProblem(
        self,
        request: problem_service_pb2.DeleteProblemRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.DeleteProblemResponse:
        result = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEMS_COLLECTION_NAME)
            .delete_one(
                {PROBLEM_ID_FIELD: self._query_id(request.problem_id)},
            )
        )

        resp = problem_service_pb2.DeleteProblemResponse()
        resp.success = result.acknowledged

        return resp

    def _group_document_to_group(
        self, group_document: Dict[Any, Any]
    ) -> problem_pb2.ProblemGroup:
        group_document[PROTOBUF_GROUP_ID_FIELD] = str(
            group_document.pop(GROUP_ID_FIELD)
        )

        group = problem_pb2.ProblemGroup()
        json_format.ParseDict(group_document, group)

        return group

    def GetProblemGroupList(
        self,
        request: problem_service_pb2.GetProblemGroupListRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.GetProblemGroupListResponse:
        groups = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEM_GROUPS_COLLECTION_NAME)
            .find({})
            .limit(request.limit)
        )

        resp = problem_service_pb2.GetProblemGroupListResponse()
        for group in groups:
            if ('public' not in group or not group['public']) and ('members' not in group or request.user_id not in group['members']):
                continue

            summary = self._group_document_to_group(group)
            resp.groups.append(summary)

        return resp

    def GetProblemGroup(
        self,
        request: problem_service_pb2.GetProblemGroupRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.GetProblemGroupResponse:
        problem_document = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEM_GROUPS_COLLECTION_NAME)
            .find_one({GROUP_ID_FIELD: self._query_id(request.group_id)})
        )

        resp = problem_service_pb2.GetProblemGroupResponse()
        resp.group.CopyFrom(self._group_document_to_group(problem_document))

        return resp

    def CreateProblemGroup(
        self,
        request: problem_service_pb2.CreateProblemGroupRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.CreateProblemGroupResponse:
        result = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEM_GROUPS_COLLECTION_NAME)
            .insert_one(json_format.MessageToDict(request.group))
        )
        request.group.id = str(result.inserted_id)

        resp = problem_service_pb2.CreateProblemGroupResponse()
        resp.group.CopyFrom(request.group)
        resp.success = result.acknowledged

        return resp

    def UpdateProblemGroup(
        self,
        request: problem_service_pb2.UpdateProblemGroupRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.UpdateProblemGroupResponse:
        group_dict = json_format.MessageToDict(request.group)

        # Artificial slowdown for frontend astethics
        time.sleep(1)

        if ('public' not in group_dict):
            group_dict['public'] = False

        if ('members' in group_dict):
            group_dict['members'] = [item for item in group_dict['members'] if item != ""]

        result = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEM_GROUPS_COLLECTION_NAME)
            .update_one(
                {
                    GROUP_ID_FIELD: self._query_id(
                        group_dict.pop(PROTOBUF_GROUP_ID_FIELD)
                    )
                },
                {"$set": group_dict},
            )
        )

        resp = problem_service_pb2.UpdateProblemGroupResponse()
        resp.success = result.acknowledged

        return resp

    def DeleteProblemGroup(
        self,
        request: problem_service_pb2.DeleteProblemGroupRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.DeleteProblemGroupResponse:
        result = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEM_GROUPS_COLLECTION_NAME)
            .delete_one(
                {GROUP_ID_FIELD: self._query_id(request.group_id)},
            )
        )

        resp = problem_service_pb2.DeleteProblemGroupResponse()
        resp.success = result.acknowledged

        return resp

    def AddTestData(
        self,
        request: problem_service_pb2.AddTestDataRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.AddTestDataResponse:
        tests = json_format.MessageToDict(request)[PROBLEM_TESTS_FIELD]

        result = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEMS_COLLECTION_NAME)
            .update_one(
                {PROBLEM_ID_FIELD: self._query_id(request.problem_id)},
                {"$push": {PROBLEM_TESTS_FIELD: {"$each": [dict(test, **{'id': str(ObjectId())}) for test in tests]}}},
            )
        )

        resp = problem_service_pb2.AddTestDataResponse()
        resp.success = result.acknowledged

        return resp

    def RemoveTestData(
        self,
        request: problem_service_pb2.RemoveTestDataRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.RemoveTestDataResponse:
        resp = problem_service_pb2.RemoveTestDataResponse()
        if len(request.test_ids) == 0:
            return resp
        
        result = (
            self.client[DATABASE_NAME]
            .get_collection(PROBLEMS_COLLECTION_NAME)
            .update_one(
                {PROBLEM_ID_FIELD: self._query_id(request.problem_id)},
                {"$pull": {PROBLEM_TESTS_FIELD: {"id": {"$in": list(request.test_ids)}}}},
            )
        )

        resp.success = result.acknowledged

        return resp

    def UpdateTestData(
        self,
        request: problem_service_pb2.UpdateTestDataRequest,
        context: grpc.ServicerContext,
    ) -> problem_service_pb2.UpdateTestDataResponse:
        raise NotImplementedError()


def serve() -> None:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    problem_service_pb2_grpc.add_ProblemServiceServicer_to_server(
        ProblemServicer(), server
    )
    server.add_insecure_port(f"[::]:{ os.environ['PORT'] }")
    log_and_flush(logging.INFO, "Starting Problem service...")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    init_logging()
    serve()
