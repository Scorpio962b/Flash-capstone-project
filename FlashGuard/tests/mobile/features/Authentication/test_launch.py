from conftest import APP_PACKAGE


def test_app_launches(driver):
    assert driver.current_package == APP_PACKAGE