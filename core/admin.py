from django.contrib import admin

from .models import (
    Utilisateur,
    Espace,
    TypeEvenement,
    Reservation,
    Paiement,
)


# ============================================================
# 1. Utilisateur
# ============================================================
@admin.register(Utilisateur)
class UtilisateurAdmin(admin.ModelAdmin):
    list_display = (
        'email',
        'username',
        'first_name',
        'last_name',
        'role',
        'is_staff',
        'is_active',
        'date_creation',
    )

    search_fields = (
        'email',
        'username',
        'first_name',
        'last_name',
    )

    list_filter = (
        'role',
        'is_staff',
        'is_active',
    )


# ============================================================
# 2. Espace
# ============================================================
@admin.register(Espace)
class EspaceAdmin(admin.ModelAdmin):
    list_display = (
        'nom',
        'capacite_max',
        'adresse',
        'est_actif',
        'date_creation',
    )

    search_fields = (
        'nom',
        'adresse',
        'description',
    )

    list_filter = (
        'est_actif',
    )


# ============================================================
# 3. Type d'événement
# ============================================================
@admin.register(TypeEvenement)
class TypeEvenementAdmin(admin.ModelAdmin):
    list_display = (
        'libelle',
        'supplement',
    )

    search_fields = (
        'libelle',
    )


# ============================================================
# 4. Réservation
# ============================================================
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'utilisateur',
        'espace',
        'type_evenement',
        'date_evenement',
        'heure_debut',
        'heure_fin',
        'nombre_personnes',
        'montant_total',
        'statut',
        'date_reservation',
    )

    search_fields = (
        'utilisateur__email',
        'utilisateur__username',
        'espace__nom',
    )

    list_filter = (
        'statut',
        'type_evenement',
        'date_evenement',
    )

    ordering = (
        '-date_reservation',
    )


# ============================================================
# 5. Paiement
# ============================================================
@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'reservation',
        'montant',
        'mode_paiement',
        'reference',
        'statut',
        'date_paiement',
    )

    search_fields = (
        'reference',
        'reservation__utilisateur__email',
    )

    list_filter = (
        'mode_paiement',
        'statut',
    )

    ordering = (
        '-date_paiement',
    )