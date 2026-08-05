import csv
import io
from typing import Any, Dict, List

from fastapi import UploadFile


async def parse_csv(file: UploadFile) -> List[Dict[str, Any]]:
    content = await file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    return [dict(row) for row in reader]
