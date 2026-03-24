from django.urls import path
from .views import serverresponse

urlpatterns = [
    path('serverresponse/', serverresponse),
]