# api/firestore_client.py

from firebase_admin import firestore

# O Admin SDK já está inicializado no settings.py, então podemos obter o cliente
db = firestore.client()