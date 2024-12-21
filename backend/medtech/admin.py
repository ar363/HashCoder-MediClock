from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Patient,
    Drug,
    PrescribedDrug,
    DeliveredDrug,
    Delivery,
    Prescription,
)

admin.site.site_header = "MedTech Admin"
admin.site.site_title = "MedTech Admin"
admin.site.index_title = "Welcome to MedTech Admin"


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    pass


@admin.register(Drug)
class DrugAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(PrescribedDrug)
class PrescribedDrugAdmin(admin.ModelAdmin):
    pass


@admin.register(DeliveredDrug)
class DeliveredDrugAdmin(admin.ModelAdmin):
    pass


@admin.register(Delivery)
class DeliveryAdmin(admin.ModelAdmin):
    pass


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
