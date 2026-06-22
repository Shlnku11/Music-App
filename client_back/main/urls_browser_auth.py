from django.urls import path
from .views import StartBrowserLoginView, CheckBrowserLoginView

urlpatterns = [
    path('start/', StartBrowserLoginView.as_view(), name='browser-login-start'),
    path('check/<uuid:token>/', CheckBrowserLoginView.as_view(), name='browser-login-check'),
]