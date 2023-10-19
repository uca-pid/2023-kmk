class TemplateHandler:
    type: str
    data: object

    def __init__(self, type: str, data: object):
        self.type = type
        self.data = data

    def generate_template(self):
        with open(
            "app/models/email_templates/PatientRegisteredAccount.html", "r"
        ) as fp:
            template_content = fp.read()
        return template_content.format(
            name=self.data["name"], last_name=self.data["last_name"]
        )
