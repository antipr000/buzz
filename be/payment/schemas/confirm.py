from core.schemas.schema_model import SchemaModel


class PaymentConfirmBody(SchemaModel):
    success: bool = True


class PaymentOutcomeResponse(SchemaModel):
    payment_id: str
    status: str
