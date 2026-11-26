import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options

APP_PACKAGE = "com.anonymous.flashguadmobileapp"
APP_ACTIVITY = ".MainActivity"


@pytest.fixture
def driver():
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    options.device_name = "emulator-5554"
    options.app_package = APP_PACKAGE
    options.app_activity = APP_ACTIVITY
    options.no_reset = True
    options.new_command_timeout = 120

    d = webdriver.Remote("http://127.0.0.1:4723", options=options)
    yield d
    d.quit()
    