from ninja import NinjaAPI, Schema, UploadedFile
from ninja.security import HttpBearer
from django.http import HttpResponse
from ninja.errors import HttpError
import os
import jwt
from django.contrib.auth.models import User
from django.conf import settings
from . import models
from datetime import datetime
import json

api = NinjaAPI(title="MedTech API", version="1.0.0")


class BearerAuth(HttpBearer):
    def authenticate(self, request, key):
        u = jwt.decode(key, settings.SECRET_KEY, algorithms=["HS256"])
        if u["userid"]:
            return u["userid"]


auth = BearerAuth()


@api.get("/ping")
def ping(request):
    return {"ping": "pong"}


class SignupData(Schema):
    phone: str
    password: str


@api.post("/signup")
def signup(request, data: SignupData, response: HttpResponse):

    if User.objects.filter(username=data.phone).exists():
        u = User.objects.filter(username=data.phone).first()
        correct_pw = u.check_password(data.password)

        if not correct_pw:
            return api.create_response(
                request, {"error": "Password is incorrect"}, status=401
            )
    else:
        u = User.objects.create_user(data.phone, None, data.password)

    token = jwt.encode({"userid": u.id}, settings.SECRET_KEY, algorithm="HS256")

    relpatient = models.Patient.objects.filter(user=u).first()
    return {
        "token": token,
        "id": u.id,
        "patient": relpatient.as_dict() if relpatient else None,
    }


@api.get("/prescriptions", auth=auth)
def prescriptions(request):
    u = User.objects.filter(id=request.auth).first()
    if not u:
        return api.create_response(request, {"error": "User not found"}, status=200)

    patient = models.Patient.objects.filter(user=u).first()
    if not patient:
        return api.create_response(
            request,
            {
                "error": "Patient not found",
                "pdatafill": True,
                "currentpdata": patient.as_dict() if patient else None,
            },
            status=200,
        )

    prescriptions = models.Prescription.objects.filter(user=u)
    return {
        "pres": [p.as_dict() for p in prescriptions],
        "currentpdata": patient.as_dict() if patient else None,
    }


@api.post("/prescriptions", auth=auth)
def new_prescription(request, file: UploadedFile):
    u = User.objects.filter(id=request.auth).first()
    if not u:
        return api.create_response(request, {"error": "User not found"}, status=200)

    p = models.Prescription.objects.create(user=u, image=file)

    return p.as_dict()


class PatientUpdateSchema(Schema):
    name: str
    breakfast_time: str
    lunch_time: str
    dinner_time: str
    address: str


@api.post("/patient", auth=auth)
def patient_update(request, data: PatientUpdateSchema):
    u = User.objects.filter(id=request.auth).first()
    if not u:
        return api.create_response(request, {"error": "User not found"}, status=200)

    patient = models.Patient.objects.filter(user=u).first()
    if not patient:
        patient = models.Patient()
        patient.user = u

    patient.name = data.name
    u.first_name = data.name
    u.save()
    patient.breakfast_time = data.breakfast_time
    patient.lunch_time = data.lunch_time
    patient.dinner_time = data.dinner_time
    patient.address = data.address
    patient.save()

    return patient.as_dict()


class PatientRoutineSchema(Schema):
    drug_id: int
    time: str
    done: bool


@api.post("/patient/routine", auth=auth)
def routine_set(request, data: PatientRoutineSchema):
    u = User.objects.filter(id=request.auth).first()
    if not u:
        return api.create_response(request, {"error": "User not found"}, status=200)

    models.Routine.objects.update_or_create(
        user=u,
        drug_id=data.drug_id,
        time=data.time,
        date=datetime.now().date(),
        defaults={"taken": data.done},
    )

    return {"ok": True}


@api.get("/patient/routine", auth=auth)
def routine_get(request):
    u = User.objects.filter(id=request.auth).first()
    if not u:
        return api.create_response(request, {"error": "User not found"}, status=200)

    routines = models.Routine.objects.filter(user=u, date=datetime.now().date())
    return {"routines": [r.as_dict() for r in routines]}


@api.get("/orders", auth=auth)
def orders(request):
    u = User.objects.filter(id=request.auth).first()
    if not u:
        return api.create_response(request, {"error": "User not found"}, status=200)

    orders = models.Delivery.objects.filter(user=u)
    return {"orders": [o.as_dict() for o in orders]}


@api.post("/order", auth=auth)
def order_place(request):
    u = User.objects.filter(id=request.auth).first()
    if not u:
        return api.create_response(request, {"error": "User not found"}, status=200)

    order = models.Delivery.objects.create(user=u)

    jdrugs = json.loads(request.body)
    for j in jdrugs["drugs"]:
        models.DeliveredDrug.objects.create(
            delivery=order, drug_id=j["drugid"], qty=j["qty"]
        )

    return order.as_dict()
