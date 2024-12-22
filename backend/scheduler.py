import requests
import time
import sqlite3
from datetime import datetime


def send_phonecall():
    requests.get(
        f"http://api.callmebot.com/start.php?source=auth&user=@ax363x&text=Please+take+your+medicine&lang=en-US-Standard-B"
    )


if __name__ == "__main__":
    while True:
        con = sqlite3.connect("db.sqlite3")
        cur = con.cursor()
        cur.execute("select * from medtech_patient;")
        data = cur.fetchall()

        if (
            datetime.time(data[0]).hour == datetime.now().time().hour
            and datetime.time(data[0]).minute == datetime.now().time().minute
        ):
            send_phonecall()

        time.sleep(5)
