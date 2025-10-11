# api/views.py (COMPLETO)

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from firebase_admin import firestore # Necessário para firestore.SERVER_TIMESTAMP
from firebase_admin import auth # Necessário para auth.delete_user (tratamento de erro)

# Importações de outros arquivos do seu app 'api'
from .models import Item
from .serializers import ItemSerializer
from .firebase_service import create_firebase_user
from .firestore_client import db # O cliente do Firestore

# ====================================================================
# 1. ROTAS DE CADASTRO E PERFIL (Firestore)
# ====================================================================

class CompleteRegisterView(APIView):
    # Permissão: Qualquer um pode se cadastrar.
    permission_classes = [AllowAny] 

    def post(self, request):
        data = request.data
        
        # 1. VALIDAÇÃO DOS DADOS
        required_auth = ["email", "password"]
        required_profile = ["nome_juridico", "cpf_cnpj", "endereco"]
        
        if not all(k in data for k in required_auth + required_profile):
            return Response({"error": "Todos os campos de Email, Senha, Nome Jurídico, CPF/CNPJ e Endereço são obrigatórios."},
                            status=status.HTTP_400_BAD_REQUEST)

        email = data.get("email")
        password = data.get("password")
        user_id = None # Inicializa user_id para uso no bloco finally
        
        # 2. CRIAÇÃO DA CONTA NO FIREBASE AUTH
        try:
            user_id = create_firebase_user(email, password)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # 3. SALVANDO DADOS EXTRAS NO FIRESTORE
        try:
            profile_data = {
                "nome_juridico": data.get("nome_juridico"),
                "cpf_cnpj": data.get("cpf_cnpj"),
                "endereco": data.get("endereco"),
                "telefone": data.get("telefone", ""), 
                "uid": user_id, 
                "criado_em": firestore.SERVER_TIMESTAMP
            }
            
            db.collection("users").document(user_id).set(profile_data)
            
            return Response({"message": "Usuário e Perfil criados com sucesso!", "uid": user_id}, 
                            status=status.HTTP_201_CREATED)

        except Exception as e:
            # Em caso de falha no Firestore, deleta o usuário do Auth para evitar contas "fantasmas"
            if user_id:
                try:
                    auth.delete_user(user_id) 
                    print(f"Conta Auth {user_id} deletada devido a erro no Firestore.")
                except Exception as auth_e:
                    print(f"Erro ao deletar conta Auth: {auth_e}")
                    
            print(f"Erro no Firestore: {e}")
            return Response({"error": "Erro interno ao salvar dados do perfil. Tente novamente."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ====================================================================
# 2. ROTAS PROTEGIDAS DE DADOS (Django/SQLite)
# ====================================================================

class ItemViewSet(viewsets.ModelViewSet):
    # Permissão: Garante que apenas usuários autenticados (via Firebase) possam acessar.
    permission_classes = [IsAuthenticated]
    serializer_class = ItemSerializer
    
    # 1. Garante que o usuário só veja seus próprios itens (GET).
    def get_queryset(self):
        # O UID do Firebase é o 'username' do request.user
        user_id = self.request.user.username
        # Filtra os objetos do Django por user_id
        return Item.objects.filter(user_id=user_id).order_by('-criado_em')

    # 2. Insere o user_id (UID do Firebase) automaticamente ao salvar um novo item (POST).
    def perform_create(self, serializer):
        user_id = self.request.user.username 
        serializer.save(user_id=user_id)