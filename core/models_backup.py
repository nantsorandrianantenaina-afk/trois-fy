
from decimal import Decimal

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator


class Utilisateur(AbstractUser):
    ROLE_CHOICES = (
        ("CLIENT", "Client"),
        ("ADMIN", "Administrateur"),
    )

    email = models.EmailField(
        unique=True,
        null=True,
        blank=True,
    )

    telephone = models.CharField(
        max_length=30,
        blank=True,
        default="",
    )

    adresse = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="CLIENT",
    )

    date_creation = models.DateTimeField(
        auto_now_add=True,
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "username",
        "first_name",
        "last_name",
    ]

    class Meta:
        db_table = "utilisateurs"

    def __str__(self):
        nom = f"{self.first_name} {self.last_name}".strip()
        return f"{nom} ({self.email or self.username})"


class Espace(models.Model):
    nom = models.CharField(max_length=150)

    description = models.TextField(
        blank=True,
        null=True,
    )

    capacite_max = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )

    prix_par_personne = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("4000.00"),
        validators=[MinValueValidator(Decimal("4000.00"))],
        editable=False,
    )

    adresse = models.CharField(max_length=255)

    image_url = models.CharField(
        max_length=500,
        blank=True,
        null=True,
    )

    est_actif = models.BooleanField(default=True)

    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "espaces"
        ordering = ["nom"]

    def __str__(self):
        return self.nom


class TypeEvenement(models.Model):
    libelle = models.CharField(
        max_length=100,
        unique=True,
    )

    supplement = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    class Meta:
        db_table = "types_evenements"
        ordering = ["libelle"]

    def __str__(self):
        return self.libelle


class Reservation(models.Model):
    STATUT_CHOICES = (
        ("EN_ATTENTE", "En attente"),
        ("CONFIRMEE", "Confirmée"),
        ("ANNULEE", "Annulée"),
        ("TERMINEE", "Terminée"),
    )

    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name="reservations",
    )

    espace = models.ForeignKey(
        Espace,
        on_delete=models.CASCADE,
        related_name="reservations",
    )

    type_evenement = models.ForeignKey(
        TypeEvenement,
        on_delete=models.CASCADE,
        related_name="reservations",
    )

    date_evenement = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()

    nombre_personnes = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )

    montant_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    statut = models.CharField(
        max_length=15,
        choices=STATUT_CHOICES,
        default="EN_ATTENTE",
    )

    date_reservation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reservations"
        ordering = ["-date_reservation"]

    def __str__(self):
        return (
            f"Réservation #{self.id} - "
            f"{self.espace.nom} - "
            f"{self.date_evenement}"
        )


class Paiement(models.Model):
    MODE_CHOICES = (
        ("ESPECES", "Espèces"),
        ("MOBILE_MONEY", "Mobile Money"),
        ("CARTE", "Carte bancaire"),
        ("VIREMENT", "Virement"),
    )

    STATUT_CHOICES = (
        ("EN_ATTENTE", "En attente"),
        ("PAYE", "Payé"),
        ("ECHEC", "Échec"),
        ("ANNULE", "Annulé"),
    )

    reservation = models.OneToOneField(
        Reservation,
        on_delete=models.CASCADE,
        related_name="paiement",
    )

    montant = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    mode_paiement = models.CharField(
        max_length=20,
        choices=MODE_CHOICES,
    )

    reference = models.CharField(
        max_length=100,
        unique=True,
    )

    date_paiement = models.DateTimeField(auto_now_add=True)

    statut = models.CharField(
        max_length=15,
        choices=STATUT_CHOICES,
        default="EN_ATTENTE",
    )

    class Meta:
        db_table = "paiements"
        ordering = ["-date_paiement"]

    def __str__(self):
        return f"Paiement {self.reference} - {self.statut}"
