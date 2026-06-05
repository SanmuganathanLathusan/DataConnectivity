from cryptography.fernet import Fernet
from app.core.config import settings

def get_encryption_key() -> bytes:
    key = settings.ENCRYPTION_KEY
    if not key or key == "32-byte-base64-encoded-key-here":
        raise RuntimeError(
            "ENCRYPTION_KEY is not set in your .env file. "
            "Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    return key.encode()

fernet = Fernet(get_encryption_key())

def encrypt_password(password: str) -> str:
    return fernet.encrypt(password.encode()).decode()

def decrypt_password(encrypted_password: str) -> str:
    return fernet.decrypt(encrypted_password.encode()).decode()
