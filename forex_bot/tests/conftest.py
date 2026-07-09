"""
conftest.py
============
Shared pytest fixtures and configuration for the forex bot test suite.
"""

import pytest


@pytest.fixture(autouse=True)
def reset_rate_limiters():
    """
    Reset all API rate limiter buckets before every test so that no test
    is throttled by a previous test's login attempts.
    """
    try:
        from api.rate_limit import _default_limiter, _login_limiter
        _default_limiter._buckets.clear()
        _login_limiter._buckets.clear()
    except Exception:
        pass
    yield