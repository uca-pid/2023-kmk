class TemplateHandler:
    type: str
    template_name: str
    data: object

    def __init__(self, type: str, data: object):
        template_for_email_type = {
            "PATIENT_REGISTERED_ACCOUNT": "PatientRegisteredAccount",
            "PHYSICIAN_REGISTERED_ACCOUNT": "PhysicianRegisteredAccount",
        }
        self.type = type
        self.template_name = template_for_email_type[self.type]
        self.data = data

    def generate_template(self):
        with open(f"app/models/email_templates/{self.template_name}.html", "r") as fp:
            template_content = fp.read()
        return template_content.format(
            name=self.data["name"], last_name=self.data["last_name"]
        )
