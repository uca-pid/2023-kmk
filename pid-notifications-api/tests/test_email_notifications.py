import pytest
import requests
from .config import *
from app.models.entities.TemplateHandler import TemplateHandler

physician_account_data = {
    "name": "Tomas",
    "last_name": "Mudano",
    "email": "mudano.tomas@gmail.com",
}

physician_account_data = {
    "name": "Tomas",
    "last_name": "Mudano",
    "email": "mudano.tomas@gmail.com",
}


def test_email_sending_endpoint_sends_returns_a_200_code():
    response_from_email_sending = requests.post(
        "http://localhost:9000/emails/send",
        json={"type": "PATIENT_REGISTERED_ACCOUNT", "data": physician_account_data},
    )

    assert response_from_email_sending.status_code == 200


def test_email_template_handler_generates_correct_HTML_from_the_patient_registered_account():
    template_handler = TemplateHandler(
        **{"type": "PATIENT_REGISTERED_ACCOUNT", "data": physician_account_data}
    )
    generated_template = template_handler.generate_template()
    with open("app/models/email_templates/PatientRegisteredAccount.html", "r") as fp:
        expected_template = fp.read()
    assert generated_template == expected_template.format(
        name=physician_account_data["name"],
        last_name=physician_account_data["last_name"],
    )


def test_email_template_handler_generates_correct_HTML_from_the_physician_registered_account():
    template_handler = TemplateHandler(
        **{"type": "PHYSICIAN_REGISTERED_ACCOUNT", "data": physician_account_data}
    )
    generated_template = template_handler.generate_template()
    with open("app/models/email_templates/PhysicianRegisteredAccount.html", "r") as fp:
        expected_template = fp.read()
    assert generated_template == expected_template.format(
        name=physician_account_data["name"],
        last_name=physician_account_data["last_name"],
    )
