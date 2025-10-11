from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth.models import User
from firebase_admin import auth

class FirebaseAuthentication(authentication.BaseAuthentication):
   
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')

        if not auth_header:
            return None  

        try:
            scheme, token = auth_header.split()
        except ValueError:
            raise exceptions.AuthenticationFailed('Cabeçalho de autenticação inválido.')
        
        if scheme.lower() != 'bearer':
            return None 

        try:

            decoded_token = auth.verify_id_token(token)
            firebase_uid = decoded_token.get('uid')
            
            
            try:
                user = User.objects.get(username=firebase_uid)
            except User.DoesNotExist:
                
                user = User.objects.create(
                    username=firebase_uid, 
                    email=decoded_token.get('email', ''), 
                    first_name=decoded_token.get('name', '')
                )
                user.set_unusable_password()
                user.save()
            
         
            return (user, None)
            
        except auth.InvalidIdTokenError:
            raise exceptions.AuthenticationFailed('Token Firebase inválido ou expirado.')
        except Exception as e:
            print(f"Erro inesperado durante a validação do token: {e}")
            raise exceptions.AuthenticationFailed('Falha na autenticação.')