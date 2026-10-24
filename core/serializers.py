
import uuid
from datetime import time
from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers

from .models import (
    Utilisateur,
    Espace,
    TypeEvenement,
    Reservation,
    Paiement,
)


class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "telephone",
            "adresse",
            "role",
            "date_creation",
        ]
        read_only_fields = ["id", "date_creation"]


class InscriptionSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "password",
            "role",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        value = value.strip().lower()
        if Utilisateur.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "Cette adresse e-mail est déjà utilisée."
            )
        return value

    def validate_username(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Le nom d'utilisateur est obligatoire."
            )
        return value

    def validate_role(self, value):
        if value == "ADMIN":
            raise serializers.ValidationError(
                "La création d'un compte administrateur n'est pas autorisée "
                "depuis cette inscription."
            )
        return value

    def create(self, validated_data):
        validated_data.pop("role", None)
        return Utilisateur.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            password=validated_data["password"],
            role="CLIENT",
        )


class ClientSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=False,
        allow_null=True,
        allow_blank=True,
        validators=[],
    )

    first_name = serializers.CharField(
        required=True,
        allow_blank=False,
    )

    last_name = serializers.CharField(
        required=True,
        allow_blank=False,
    )

    telephone = serializers.CharField(
        required=True,
        allow_blank=False,
    )

    adresse = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "first_name",
            "last_name",
            "telephone",
            "email",
            "adresse",
            "role",
            "date_creation",
        ]
        read_only_fields = [
            "id",
            "role",
            "date_creation",
        ]

    def validate_email(self, value):
        if value is None:
            return None

        value = value.strip().lower()

        if not value:
            return None

        queryset = Utilisateur.objects.filter(email__iexact=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "Cette adresse e-mail est déjà utilisée."
            )

        return value

    def validate_first_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Le prénom est obligatoire."
            )
        return value

    def validate_last_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Le nom est obligatoire."
            )
        return value

    def validate_telephone(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Le téléphone est obligatoire."
            )
        return value

    def validate_adresse(self, value):
        return value.strip()

    def create(self, validated_data):
        validated_data["username"] = (
            f"client_{uuid.uuid4().hex}"
        )
        validated_data["role"] = "CLIENT"

        return Utilisateur.objects.create_user(
            password=None,
            **validated_data,
        )


class TypeEvenementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeEvenement
        fields = ["id", "libelle", "supplement"]
        read_only_fields = ["id"]

    def validate_libelle(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Le libellé de l'événement est obligatoire."
            )
        return value

    def validate_supplement(self, value):
        if value < Decimal("0.00"):
            raise serializers.ValidationError(
                "Le supplément ne peut pas être négatif."
            )
        return value


class EspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Espace
        fields = [
            "id",
            "nom",
            "description",
            "capacite_max",
            "prix_par_personne",
            "adresse",
            "image_url",
            "est_actif",
            "date_creation",
        ]
        read_only_fields = [
            "id",
            "prix_par_personne",
            "date_creation",
        ]

    def validate_nom(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Le nom de l'espace est obligatoire."
            )
        return value

    def validate_capacite_max(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "La capacité doit être supérieure ou égale à 1 personne."
            )
        return value

    def validate_adresse(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "L'adresse de l'espace est obligatoire."
            )
        return value


class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = [
            "id",
            "reservation",
            "montant",
            "mode_paiement",
            "reference",
            "statut",
            "date_paiement",
        ]
        read_only_fields = [
            "id",
            "montant",
            "statut",
            "date_paiement",
        ]

    def validate_reference(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "La référence du paiement est obligatoire."
            )
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        reservation = attrs.get("reservation")

        if self.instance is not None:
            raise serializers.ValidationError(
                "Un paiement existant ne peut pas être recréé."
            )

        if reservation is None:
            raise serializers.ValidationError({
                "reservation": "La réservation est obligatoire."
            })

        if request is None or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Un utilisateur authentifié est obligatoire."
            )

        if (
            request.user.role != "ADMIN"
            and reservation.utilisateur_id != request.user.id
        ):
            raise serializers.ValidationError({
                "reservation": "Cette réservation ne vous appartient pas."
            })

        if reservation.statut in ["ANNULEE", "TERMINEE"]:
            raise serializers.ValidationError({
                "reservation": (
                    "Cette réservation ne peut pas recevoir de paiement."
                )
            })

        if Paiement.objects.filter(reservation=reservation).exists():
            raise serializers.ValidationError({
                "reservation": (
                    "Un paiement existe déjà pour cette réservation."
                )
            })

        return attrs

    def create(self, validated_data):
        reservation = validated_data["reservation"]
        validated_data["montant"] = reservation.montant_total
        validated_data["statut"] = "EN_ATTENTE"
        return Paiement.objects.create(**validated_data)


class ReservationDetailSerializer(serializers.ModelSerializer):
    utilisateur = UtilisateurSerializer(read_only=True)

    espace_detail = EspaceSerializer(
        source="espace",
        read_only=True,
    )

    type_evenement_detail = TypeEvenementSerializer(
        source="type_evenement",
        read_only=True,
    )

    paiement = PaiementSerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id",
            "utilisateur",
            "espace",
            "espace_detail",
            "type_evenement",
            "type_evenement_detail",
            "date_evenement",
            "heure_debut",
            "heure_fin",
            "nombre_personnes",
            "montant_total",
            "statut",
            "date_reservation",
            "paiement",
        ]


class ReservationEcritureSerializer(serializers.ModelSerializer):
    utilisateur = serializers.PrimaryKeyRelatedField(
        queryset=Utilisateur.objects.filter(role="CLIENT"),
    )

    class Meta:
        model = Reservation
        fields = [
            "id",
            "utilisateur",
            "espace",
            "type_evenement",
            "date_evenement",
            "heure_debut",
            "heure_fin",
            "nombre_personnes",
            "montant_total",
            "statut",
        ]
        read_only_fields = [
            "id",
            "montant_total",
            "statut",
        ]

    def validate(self, attrs):
        instance = self.instance

        date_evenement = attrs.get(
            "date_evenement",
            instance.date_evenement if instance else None,
        )
        espace = attrs.get(
            "espace",
            instance.espace if instance else None,
        )
        type_evenement = attrs.get(
            "type_evenement",
            instance.type_evenement if instance else None,
        )
        nombre_personnes = attrs.get(
            "nombre_personnes",
            instance.nombre_personnes if instance else None,
        )
        heure_debut = attrs.get(
            "heure_debut",
            instance.heure_debut if instance else None,
        )
        heure_fin = attrs.get(
            "heure_fin",
            instance.heure_fin if instance else None,
        )

        if any(
            value is None
            for value in [
                date_evenement,
                espace,
                type_evenement,
                nombre_personnes,
                heure_debut,
                heure_fin,
            ]
        ):
            raise serializers.ValidationError(
                "Tous les champs obligatoires doivent être renseignés."
            )

        maintenant = timezone.localtime()
        date_systeme = maintenant.date()
        heure_systeme = maintenant.time().replace(
            second=0,
            microsecond=0,
        )
        heure_min = time(7, 30)

        if date_evenement < date_systeme:
            raise serializers.ValidationError({
                "date_evenement": (
                    "La date de l'événement ne peut pas être dans le passé."
                )
            })

        if not espace.est_actif:
            raise serializers.ValidationError({
                "espace": "Cet espace est actuellement désactivé."
            })

        if nombre_personnes < 1:
            raise serializers.ValidationError({
                "nombre_personnes": (
                    "Le nombre de personnes doit être au minimum de 1."
                )
            })

        if nombre_personnes > espace.capacite_max:
            raise serializers.ValidationError({
                "nombre_personnes": (
                    f"La capacité maximale de cet espace est de "
                    f"{espace.capacite_max} personnes."
                )
            })

        if date_evenement == date_systeme:
            if heure_systeme < heure_min:
                heure_debut = heure_min
            else:
                heure_debut = heure_systeme
            attrs["heure_debut"] = heure_debut
        elif heure_debut < heure_min:
            raise serializers.ValidationError({
                "heure_debut": (
                    "L'heure de début ne peut pas être inférieure à 07:30."
                )
            })

        if heure_fin <= heure_debut:
            raise serializers.ValidationError({
                "heure_fin": (
                    "L'heure de fin doit être supérieure à l'heure de début."
                )
            })

        reservations = Reservation.objects.filter(
            espace=espace,
            date_evenement=date_evenement,
        ).exclude(statut="ANNULEE")

        if instance:
            reservations = reservations.exclude(pk=instance.pk)

        chevauchement = reservations.filter(
            heure_debut__lt=heure_fin,
            heure_fin__gt=heure_debut,
        ).exists()

        if chevauchement:
            raise serializers.ValidationError({
                "heure_debut": (
                    "Cet espace est déjà réservé pendant cet horaire."
                )
            })

        if instance and hasattr(instance, "paiement"):
            paiement = instance.paiement
            changements = (
                espace != instance.espace
                or type_evenement != instance.type_evenement
                or date_evenement != instance.date_evenement
                or heure_debut != instance.heure_debut
                or heure_fin != instance.heure_fin
                or nombre_personnes != instance.nombre_personnes
            )

            if changements and paiement.statut == "PAYE":
                raise serializers.ValidationError(
                    "Une réservation déjà payée ne peut pas être modifiée."
                )

        return attrs

    def _calculer_montant(self, validated_data, instance=None):
        espace = validated_data.get(
            "espace",
            instance.espace if instance else None,
        )
        type_evenement = validated_data.get(
            "type_evenement",
            instance.type_evenement if instance else None,
        )
        nombre_personnes = validated_data.get(
            "nombre_personnes",
            instance.nombre_personnes if instance else None,
        )
        heure_fin = validated_data.get(
            "heure_fin",
            instance.heure_fin if instance else None,
        )

        montant_personnes = (
            Decimal(nombre_personnes) * espace.prix_par_personne
        )
        supplement_evenement = type_evenement.supplement
        supplement_apres_18h = (
            Decimal("20000.00")
            if heure_fin > time(18, 0)
            else Decimal("0.00")
        )

        return (
            montant_personnes
            + supplement_evenement
            + supplement_apres_18h
        )

    def create(self, validated_data):
        validated_data["statut"] = "EN_ATTENTE"
        validated_data["montant_total"] = self._calculer_montant(
            validated_data
        )

        return Reservation.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("statut", None)
        validated_data.pop("montant_total", None)

        donnees_calcul = {
            "espace": validated_data.get("espace", instance.espace),
            "type_evenement": validated_data.get(
                "type_evenement",
                instance.type_evenement,
            ),
            "nombre_personnes": validated_data.get(
                "nombre_personnes",
                instance.nombre_personnes,
            ),
            "heure_fin": validated_data.get(
                "heure_fin",
                instance.heure_fin,
            ),
        }

        instance.montant_total = self._calculer_montant(
            donnees_calcul,
            instance,
        )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
