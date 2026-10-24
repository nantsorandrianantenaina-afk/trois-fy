
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    UtilisateurViewSet,
    ClientViewSet,
    EspaceViewSet,
    TypeEvenementViewSet,
    ReservationViewSet,
    PaiementViewSet,
)

router = DefaultRouter()

router.register(
    r"utilisateurs",
    UtilisateurViewSet,
    basename="utilisateur",
)

router.register(
    r"clients",
    ClientViewSet,
    basename="client",
)

router.register(
    r"espaces",
    EspaceViewSet,
    basename="espace",
)

router.register(
    r"types-evenements",
    TypeEvenementViewSet,
    basename="type-evenement",
)

router.register(
    r"reservations",
    ReservationViewSet,
    basename="reservation",
)

router.register(
    r"paiements",
    PaiementViewSet,
    basename="paiement",
)

urlpatterns = [
    path("", include(router.urls)),
    path(
        "auth/login/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path(
        "auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
]
