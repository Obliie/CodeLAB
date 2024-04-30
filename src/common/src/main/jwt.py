import json
import logging
import os
from typing import Any, Dict
from Crypto.Protocol.KDF import HKDF
from Crypto.Hash import SHA256 
from jose import jwe
from common.service_logging import log_and_flush

def get_derived_encryption_key(secret: str) -> Any:
    context = str.encode("NextAuth.js Generated Encryption Key")
    return HKDF(
        master=secret.encode(),
        key_len=32,
        salt="".encode(),
        hashmod=SHA256,
        num_keys=1,
        context=context,
    )

def decrypt_jwt(jwt: str) -> Dict[str, Any]:
    jwt_secret = os.environ.get("NEXTAUTH_SECRET")
    encryption_key = get_derived_encryption_key(jwt_secret)
    payload_str = jwe.decrypt(jwt, encryption_key).decode()
    payload: dict[str, Any] = json.loads(payload_str)
    
    return payload