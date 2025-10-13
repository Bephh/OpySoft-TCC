# api/urls.py

from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import ItemViewSet, CompleteRegisterView

router = DefaultRouter()
# Cria as rotas GET, POST, PUT/PATCH, DELETE para /api/itens/
router.register(r'itens', ItemViewSet, basename='item') 

urlpatterns = [
    # Rota pública para cadastro (Parte 1)
    path('register/', CompleteRegisterView.as_view(), name='complete-register'),
    
    # Rotas do ItemViewSet (Parte 2)
]
urlpatterns += router.urls