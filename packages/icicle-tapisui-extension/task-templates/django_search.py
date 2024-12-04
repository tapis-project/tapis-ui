#-------- Workflow Context import: DO NOT REMOVE ----------------
from owe_python_sdk.runtime import execution_context as ctx
#-------- Workflow Context import: DO NOT REMOVE ----------------

import uuid
import pandas as pd
import requests
import logging
from typing import List
import time
import json

# API Endpoint configuration
API_HOST = ctx.get_input("API_HOST", "https://icfoods-know.o18s.com/api/know")
API_URL_CREATE_CONCEPT = f"{API_HOST}/concept/create/"
API_URL_CREATE_INSTANCE = f"{API_HOST}/instance/create/"
API_URL_CREATE_RELATION = f"{API_HOST}/relation/create/"
API_URL_CREATE_PROPOSITION = f"{API_HOST}/proposition/create/"
PROPOSITIONS_SEARCH_URL = f"{API_HOST}/propositions/"


def search_subjects(object: str, predicate: str) -> List[str]:
    """
    Search for propositions based on the given object and predicate.

    Args:
        object: The object of the propositions.
        predicate: The predicate of the propositions.

    Returns:
        A list of subject labels from the search results.
    """
    url = f"{PROPOSITIONS_SEARCH_URL}object/{object}/predicate/{predicate}/"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        subjects = []
        for obj in data:
            subjects.append(obj.get("subject_label"))
        return subjects
    except requests.RequestException as e:
        msg = f"Failed to search propositions: {e}"
        ctx.stderr(1, msg)


inp_object = ctx.get_input("OBJECT", default="objectStr")
inp_predicate = ctx.get_input("PREDICATE", default="predicateStr")

try:
    subjects = search_subjects(inp_object, inp_predicate)
except Exception as e:
    ctx.stderr(1, f"Failed to authenticate: {e}")


ctx.set_output("django_search_results", json.dumps(subjects))

