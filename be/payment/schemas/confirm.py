from core.schemas.schema_model import SchemaModel


class PaymentConfirmBody(SchemaModel):
    success: bool = True


class WebhookBody(SchemaModel):
    payment_id: str | None = None
    success: bool = False


class PaymentOutcomeResponse(SchemaModel):
    payment_id: str
    status: str
