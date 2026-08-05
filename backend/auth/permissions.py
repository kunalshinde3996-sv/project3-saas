from typing import List

from fastapi import Depends, HTTPException, status

from auth.jwt import get_current_user
from models.user import User


def require_role(allowed_roles: List[str]):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return dependency
