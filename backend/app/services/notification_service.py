import json
import logging
import urllib.request
import urllib.error
from typing import Any, Mapping

logger = logging.getLogger("notifications")


def send_webhook(url: str, payload: Mapping[str, Any], timeout: int = 5) -> None:
    """Send a JSON POST to a webhook URL. Non-fatal on errors."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            logger.info("Webhook sent to %s, status=%s", url, resp.status)
    except urllib.error.URLError as exc:
        logger.exception("Failed to send webhook to %s: %s", url, exc)


def send_email_stub(to_address: str, subject: str, body: str) -> None:
    """Placeholder email sender: logs the message. Replace with real mailer when needed."""
    logger.info("Email to %s: %s\n%s", to_address, subject, body)
