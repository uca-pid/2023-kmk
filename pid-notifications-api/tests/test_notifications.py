import pytest
import requests
from .config import *
from app.models.entities.TemplateHandler import TemplateHandler

patient_account_data = {
    "name": "Tomas",
    "last_name": "Mudano",
    "email": "mudanotomas@gmail.com",
}


def test_email_sending_endpoint_sends_returns_a_200_code():
    response_from_email_sending = requests.post(
        "http://localhost:9000/emails/send",
        json={"type": "PATIENT_REGISTERED_ACCOUNT", "data": patient_account_data},
    )

    assert response_from_email_sending.status_code == 200


def test_email_template_handler_generates_correct_HTML_from_the_correct_template():
    template_handler = TemplateHandler(
        **{"type": "PATIENT_REGISTERED_ACCOUNT", "data": patient_account_data}
    )
    generated_template = template_handler.generate_template()
    with open("app/models/email_templates/PatientRegisteredAccount.html", "r") as fp:
        expected_template = fp.read()
    assert generated_template == expected_template.format(
        name=patient_account_data["name"], last_name=patient_account_data["last_name"]
    )
