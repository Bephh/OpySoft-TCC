# api/models.py

from django.db import models

class Item(models.Model):
    # O user_id armazena o UID do Firebase do usuário proprietário
    user_id = models.CharField(max_length=128, db_index=True)
    
    # Campos de exemplo para o item
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nome} (Proprietário: {self.user_id})"