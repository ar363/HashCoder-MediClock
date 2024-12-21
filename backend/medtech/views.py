from ninja import NinjaAPI, Schema
from ninja.security import HttpBearer
from django.http import HttpResponse
import os
import jwt
from django.contrib.auth.models import User
from django.conf import settings

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
            return {"error": "Password is incorrect"}
    else:
        u = User.objects.create_user(data.email, data.email, data.password)

    token = jwt.encode({"userid": u.id}, settings.SECRET_KEY, algorithm="HS256")

    return {"token": token}
