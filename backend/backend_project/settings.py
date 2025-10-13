import firebase_admin
from firebase_admin import credentials
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Caminho completo para a chave de serviço
FIREBASE_SERVICE_ACCOUNT_PATH = BASE_DIR / 'serviceAccountKey.json' 

# CORREÇÃO CRÍTICA: Adicione o 'if' e corrija a indentação
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH) # Colocar a private key aqui
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK inicializado com sucesso!")
    except FileNotFoundError:
        print("ERRO: Chave do Firebase não encontrada. A autenticação Firebase falhará.")
        
# ------------------ CONFIGURAÇÕES BÁSICAS ------------------

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-bj&=2r-)=!t(u^&kr#(ieyeink=2y9o304_u^^m6(+$e$(2xhn'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# CORREÇÃO: Adicionando hosts de desenvolvimento para evitar erros
ALLOWED_HOSTS = ['127.0.0.1', 'localhost']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'corsheaders',
    
    'api', 
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend_project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # ADICIONE O DOMÍNIO DE PRODUÇÃO DO FIREBASE HOSTING AQUI
]

CORS_ALLOW_CREDENTIALS = True 


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'api.authentication.FirebaseAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}


LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'