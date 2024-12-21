import csv
from django.core.management.base import BaseCommand
from medtech.models import Drug
from django.conf import settings


class Command(BaseCommand):
    help = "Load drugs from a CSV file"

    def handle(self, *args, **kwargs):

        if Drug.objects.exists():
            self.stdout.write(self.style.SUCCESS("Drugs already loaded"))
            return

        with open(
            settings.BASE_DIR / "medtech" / "management" / "commands" / "drugs.csv",
            newline="",
        ) as csvfile:
            reader = csv.DictReader(csvfile)
            ds = []
            for row in reader:
                if row["discont"] == "FALSE":
                    d = Drug(
                        name=row["name"],
                        pack_size=row["pack_size_label"],
                        price=row["price"],
                        manufacturer=row["manufacturer_name"],
                    )
                    ds.append(d)

            Drug.objects.bulk_create(ds)

        self.stdout.write(self.style.SUCCESS("Successfully loaded drugs"))
