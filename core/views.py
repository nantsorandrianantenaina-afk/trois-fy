
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import (
    Espace,
    TypeEvenement,
    Reservation,
    Paiement,
)
from .serializers import (
    UtilisateurSerializer,
    InscriptionSerializer,
    ClientSerializer,
    EspaceSerializer,
    TypeEvenementSerializer,
    ReservationDetailSerializer,
    ReservationEcritureSerializer,
    PaiementSerializer,
)

Utilisateur = get_user_model()



def mettre_a_jour_reservations_terminees():
    maintenant = timezone.localtime()
    date_actuelle = maintenant.date()
    heure_actuelle = maintenant.time()

    reservations_a_terminer = Reservation.objects.exclude(
        statut__in=["ANNULEE", "TERMINEE"]
    ).filter(
        date_evenement__lt=date_actuelle
    )

    reservations_aujourd_hui = Reservation.objects.exclude(
        statut__in=["ANNULEE", "TERMINEE"]
    ).filter(
        date_evenement=date_actuelle,
        heure_fin__lte=heure_actuelle,
    )

    reservations_a_terminer.update(statut="TERMINEE")
    reservations_aujourd_hui.update(statut="TERMINEE")



class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ADMIN"
        )


class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.all().order_by("-date_creation")

    def get_serializer_class(self):
        if self.action == "create":
            return InscriptionSerializer
        return UtilisateurSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Utilisateur.objects.filter(
            role="CLIENT"
        ).order_by("-date_creation")


class EspaceViewSet(viewsets.ModelViewSet):
    queryset = Espace.objects.all().order_by("nom")
    serializer_class = EspaceSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class TypeEvenementViewSet(viewsets.ModelViewSet):
    queryset = TypeEvenement.objects.all().order_by("libelle")
    serializer_class = TypeEvenementSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [IsAdminUser()]


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all().order_by("-date_reservation")

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return ReservationDetailSerializer
        return ReservationEcritureSerializer

    def get_permissions(self):
        return [IsAdminUser()]

    def get_queryset(self):
        mettre_a_jour_reservations_terminees()

        return Reservation.objects.select_related(
            "utilisateur",
            "espace",
            "type_evenement",
        ).prefetch_related(
            "paiement",
        ).order_by("-date_reservation")

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        reservation = self.get_object()

        if (
            hasattr(reservation, "paiement")
            and reservation.paiement.statut == "PAYE"
        ):
            donnees = serializer.validated_data

            champs_proteges = [
                "utilisateur",
                "espace",
                "type_evenement",
                "date_evenement",
                "heure_debut",
                "heure_fin",
                "nombre_personnes",
            ]

            if any(
                champ in donnees
                and donnees[champ] != getattr(reservation, champ)
                for champ in champs_proteges
            ):
                raise ValidationError(
                    "Une réservation déjà payée ne peut pas être modifiée."
                )

        serializer.save()


class PaiementViewSet(viewsets.ModelViewSet):
    queryset = Paiement.objects.select_related(
        "reservation",
        "reservation__utilisateur",
        "reservation__espace",
    ).order_by("-date_paiement")

    serializer_class = PaiementSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "create"]:
            return [permissions.IsAuthenticated()]

        return [IsAdminUser()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if not user.is_authenticated:
            return queryset.none()

        if user.role == "ADMIN":
            return queryset

        return queryset.filter(
            reservation__utilisateur=user
        )

    @action(detail=True, methods=["post"])
    def confirmer_paiement(self, request, pk=None):
        with transaction.atomic():
            mettre_a_jour_reservations_terminees()

            paiement = self.get_object()
            reservation = paiement.reservation

            reservation.refresh_from_db()

            if paiement.statut == "PAYE":
                raise ValidationError(
                    "Ce paiement est déjà confirmé."
                )

            if paiement.statut != "EN_ATTENTE":
                raise ValidationError(
                    "Seul un paiement en attente peut être confirmé."
                )

            if reservation.statut == "ANNULEE":
                raise ValidationError(
                    "Impossible de confirmer une réservation annulée."
                )

            if reservation.statut == "TERMINEE":
                raise ValidationError(
                    "Impossible de confirmer le paiement : "
                    "l'heure de fin de la réservation est dépassée."
                )

            paiement.statut = "PAYE"
            paiement.save(update_fields=["statut"])

            reservation.statut = "CONFIRMEE"
            reservation.save(update_fields=["statut"])

        return Response({
            "status": "Paiement confirmé",
            "paiement_id": paiement.id,
            "reservation_id": reservation.id,
            "reservation_statut": reservation.statut,
        })
