# api/firebase_service.py

import firebase_admin
from firebase_admin import auth

def create_firebase_user(email: str, password: str) -> str:
    """
    Cria um usuário no Firebase Authentication e retorna o UID.
    """
    try:
        # Usa o SDK Admin para criar a conta com email e senha
        user = auth.create_user(
            email=email,
            password=password
        )
        # Retorna o UID (Identificador Único)
        return user.uid
    except firebase_admin.exceptions.FirebaseError as e:
        # Trata erros como email já em uso, senha fraca, etc.
        # Você pode refinar o tratamento de exceção aqui.
        raise ValueError(f"Erro ao criar usuário no Firebase: {e}")