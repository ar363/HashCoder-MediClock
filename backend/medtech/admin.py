from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Patient,
    Drug,
    PrescribedDrug,
    DeliveredDrug,
    Delivery,
    Prescription,
    Routine,
)

admin.site.site_header = "MediClock Admin"
admin.site.site_title = "MediClock Admin"
admin.site.index_title = "MediClock Admin"


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ["name"]


@admin.register(Drug)
class DrugAdmin(admin.ModelAdmin):
    search_fields = ["name"]
    list_display = ["name", "pack_size", "price", "manufacturer"]


@admin.register(PrescribedDrug)
class PrescribedDrugAdmin(admin.ModelAdmin):
    list_display = [
        "drug",
        "patient_name",
        "morning_qty",
        "afternoon_qty",
        "night_qty",
        "prescription__created_at",
    ]
    autocomplete_fields = ["drug", "prescription"]


@admin.register(DeliveredDrug)
class DeliveredDrugAdmin(admin.ModelAdmin):
    pass

class DeliveredDrugInline(admin.TabularInline):
    model = DeliveredDrug
    extra = 0
    autocomplete_fields = ["drug"]

@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    list_display = ["patient_name", "status"]
    inlines = [DeliveredDrugInline]


class PrescribedDrugInline(admin.TabularInline):
    model = PrescribedDrug
    extra = 0
    autocomplete_fields = ["drug"]


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    inlines = [PrescribedDrugInline]
    search_fields = ["user__username", "user__first_name", "user__last_name", "notes"]
    list_filter = ["user"]
    fields = ["user", "view_image", "image", "notes"]
    readonly_fields = ["view_image"]
    list_display = ["id", "patient_name", "created_at", "notes"]

    @admin.display(description="Prescription Image")
    def view_image(self, obj):
        return format_html(
            '<img src="{}" style="width: 100%; max-width: 500px; height: auto;" />',
            obj.image.url,
        )

    class Media:
        css = {"all": ["/static/adm.css"]}


@admin.register(Routine)
class RoutineAdmin(admin.ModelAdmin):
    list_display = ["patient_name", "drug", "date", "rtime", "taken"]
    autocomplete_fields = ["drug"]
