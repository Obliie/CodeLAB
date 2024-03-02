from typing import Dict
from jose import jwe

def decrypt_jwt(jwt: str, secret: str) -> Dict[str, str]:
    try:
        decrypted_token = jwe.decrypt(jwt, secret)
        print("Decrypted Token:", decrypted_token)
    except Exception as e:
        print("Error decrypting token:", e)

    