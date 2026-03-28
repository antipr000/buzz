from core.schemas.camel import CamelModel


class PaymentConfirmBody(CamelModel):
    success: bool = True


class WebhookBody(CamelModel):
    payment_id: str | None = None
    success: bool = False
