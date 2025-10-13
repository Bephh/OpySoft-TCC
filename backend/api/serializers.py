# api/serializers.py

from rest_framework import serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__' 
        # Garante que o usuário não pode enviar ou modificar o 'user_id'
        read_only_fields = ('user_id',)