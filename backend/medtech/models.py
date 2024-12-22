from django.db import models

from django.contrib.auth.models import User


class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="patient")
    name = models.CharField(max_length=500, blank=True, null=True)
    breakfast_time = models.TimeField()
    lunch_time = models.TimeField()
    dinner_time = models.TimeField()
    address = models.TextField()

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "breakfast_time": self.breakfast_time,
            "lunch_time": self.lunch_time,
            "dinner_time": self.dinner_time,
            "address": self.address,
        }


class Drug(models.Model):
    name = models.CharField(max_length=500)
    pack_size = models.CharField(max_length=500)
    price = models.FloatField()
    manufacturer = models.CharField(max_length=500)

    def get_sterm(self):
        x = self.pack_size.split(" ")[0]
        if x == "strip":
            return "tablet"
        if x == "vial":
            return "vial"
        if x == "bottle":
            return "ml"
        return x

    def total_quantity(self):
        x = self.pack_size.split(" ")[0]
        if x == "strip" and self.pack_size.split(" ")[2].isdigit():
            return int(self.pack_size.split(" ")[2])
        if x == "vial":
            return 1
        if x == "bottle":
            return int(self.pack_size.split(" ")[2])
        return 1

    def as_dict(self):
        return {
            "id": self.id,
            "pack_size": self.pack_size,
            "price": self.price,
            "manufacturer": self.manufacturer,
            "singular_term": self.get_sterm(),
        }

    def __str__(self):
        return f"{self.name} - {self.manufacturer}"


class PrescribedDrug(models.Model):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    prescription = models.ForeignKey("Prescription", on_delete=models.CASCADE)
    morning_qty = models.FloatField(default=0)
    afternoon_qty = models.FloatField(default=0)
    night_qty = models.FloatField(default=0)
    custom_qty = models.FloatField(
        verbose_name="Custom qty (if applicable)", blank=True, null=True, editable=False
    )
    custom_time = models.TimeField(
        verbose_name="Custom time (if applicable)",
        blank=True,
        null=True,
        editable=False,
    )
    amt_remaining = models.FloatField(default=0, editable=False)

    def as_dict(self):
        return {
            "id": self.id,
            "drug": self.drug.name,
            "drug_info": self.drug.as_dict(),
            "morning_qty": self.morning_qty,
            "afternoon_qty": self.afternoon_qty,
            "night_qty": self.night_qty,
            "custom_qty": self.custom_qty,
            "custom_time": self.custom_time,
            "amt_remaining": self.amt_remaining,
        }


class DeliveredDrug(models.Model):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    delivery = models.ForeignKey("Delivery", on_delete=models.CASCADE)
    qty = models.FloatField()
    delivered_at = models.DateTimeField(auto_now_add=True)


class Delivery(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    drugs = models.ManyToManyField(Drug, through="DeliveredDrug")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Delivery"
        verbose_name_plural = "Deliveries"


class Prescription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    drugs = models.ManyToManyField(Drug, through=PrescribedDrug)
    image = models.ImageField(upload_to="prescriptions/")
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def patient_name(self):
        if self.user.patient:
            return self.user.patient.name
        else:
            return "-"

    def __str__(self):
        return f'Prescription for {self.user.username} - {self.created_at.strftime("%d-%m-%Y %H:%M:%S")}'

    def as_dict(self):
        return {
            "id": self.id,
            "image": self.image.url,
            "created_at": self.created_at,
            "notes": self.notes,
            "drugs": [d.as_dict() for d in self.prescribeddrug_set.all()],
        }

    class Meta:
        ordering = ["-created_at"]


class Routine(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.CharField(max_length=10)
    taken = models.BooleanField(default=False)

    def as_dict(self):
        return {
            "drug_id": self.drug.id,
            "time": self.time,
            "taken": self.taken,
        }