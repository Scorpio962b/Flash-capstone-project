import { When, Then, Before } from '@cucumber/cucumber';
// ======================================================
// MOB-AUTH-03.2: CAMERA FACE-CHECK AUTHENTICATION
// ======================================================

const appPackage = 'com.anonymous.flashguadmobileapp';

// Camera face-check elements
const cameraFaceCheckButton = () =>
  $('android=new UiSelector().textContains("Sign in with Camera Face Check")');

const faceCheckModalTitle = () =>
  $('android=new UiSelector().text("Face Check")');

const cameraCancelButton = () =>
  $('android=new UiSelector().text("Cancel")');

const cameraPreviewStatus = (status: string) =>
  $(`android=new UiSelector().text("${status}")`);

const cameraAccessAlert = () =>
  $('android=new UiSelector().text("Camera access required")');

// System permission dialog buttons
const cameraAllowButton = () =>
  $('android=new UiSelector().text("While using the app")');

const cameraAllowOnceButton = () =>
  $('android=new UiSelector().text("Only this time")');

const cameraDenyButtons = () => [
  $('android=new UiSelector().text("Don’t allow")'),
  $(`android=new UiSelector().text("Don't allow")`)
];

async function setCameraPermission(action: 'grant' | 'revoke'): Promise<void> {
  await driver.execute('mobile: changePermissions', {
    permissions: 'android.permission.CAMERA',
    appPackage,
    action
  });
  const permissions: unknown = await driver.execute('mobile: getPermissions', {
    appPackage,
    type: action === 'grant' ? 'granted' : 'denied'
  });
  const expectedState = action === 'grant' ? 'granted' : 'revoked';

  if (!Array.isArray(permissions) || !permissions.includes('android.permission.CAMERA')) {
    throw new Error(`Could not verify that camera permission was ${expectedState}.`);
  }
}

async function verifyLoginScreen(): Promise<void> {
  await cameraFaceCheckButton().waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Login screen was not displayed.'
  });
}

Before({ tags: '@permission' }, async () => {
  await setCameraPermission('revoke');
});

Before({ tags: '@camera and @negative and not @permission' }, async () => {
  await setCameraPermission('grant');
});

Before({ tags: '@camera and @positive' }, async () => {
  await setCameraPermission('grant');
});

// MOB-AUTH-03.2: Open camera face-check

When('the merchant selects camera face-check', async () => {
  console.log('\n========== MOB-AUTH-03.2 CAMERA FACE-CHECK ==========');

  const button = cameraFaceCheckButton();

  await button.waitForDisplayed({
    timeout: 15000,
    timeoutMsg: 'Camera face-check button was not displayed.'
  });

  await button.click();

  console.log('Camera face-check selected.');
});


// MOB-AUTH-03.2: Grant camera permission if requested


When('the merchant grants camera permission if requested', async () => {
  console.log('\n========== CAMERA PERMISSION ==========');

  const allowButton = cameraAllowButton();
  const allowOnceButton = cameraAllowOnceButton();
  const grantedPermissions: unknown = await driver.execute('mobile: getPermissions', {
    appPackage,
    type: 'granted'
  });

  if (!Array.isArray(grantedPermissions)) {
    throw new Error('Could not read the app camera permission state.');
  }

  if (grantedPermissions.includes('android.permission.CAMERA')) {
    console.log('Camera permission is already granted.');
  } else {
    await driver.waitUntil(
      async () => {
        if (await allowButton.isDisplayed()) {
          await allowButton.click();
          return true;
        }

        if (await allowOnceButton.isDisplayed()) {
          await allowOnceButton.click();
          return true;
        }

        return false;
      },
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: 'Android camera permission prompt was not displayed.'
      }
    );

    console.log('Camera permission granted.');
  }

  await faceCheckModalTitle().waitForDisplayed({
    timeout: 20000,
    timeoutMsg: 'Face Check modal did not appear after permission was granted.'
  });

  console.log('Face Check modal displayed successfully.');
});


// MOB-AUTH-03.2: Verify camera readiness


Then('the camera preview should become ready', async () => {
  console.log('\n========== CAMERA FACE-CHECK PROGRESS ==========');

  await driver.waitUntil(async () => {
    const checking = await cameraPreviewStatus('Checking your smile...').isExisting();
    const accepted = await cameraPreviewStatus('Smile accepted. Signing you in...').isExisting();
    const loggedIn = await $('android=new UiSelector().text("Alice Ledger")').isExisting();

    return checking || accepted || loggedIn;
  }, {
    timeout: 30000,
    interval: 500,
    timeoutMsg: 'Camera capture did not start or complete, and dashboard access was not detected.'
  });

  console.log('Camera face-check progressed beyond its initial state.');
});



// MOB-AUTH-03.2: Verify automatic capture


Then('the camera face-check should complete', async () => {
  console.log('\n========== CAMERA FACE-CHECK COMPLETION ==========');

  const dashboard = $('android=new UiSelector().text("Alice Ledger")');

  await dashboard.waitForDisplayed({
    timeout: 90000,
    timeoutMsg: 'Camera face-check did not result in successful dashboard access.'
  });

  console.log('Camera face-check flow resulted in dashboard access.');
});



// MOB-AUTH-03.2: Cancel camera face-check

When('the merchant cancels camera face-check', async () => {
  const cancelButton = cameraCancelButton();

  await cancelButton.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Camera cancellation button was not displayed.'
  });

  await cancelButton.click();

  console.log('Merchant cancelled camera face-check.');
});

Then('the camera face-check modal should close', async () => {
  await faceCheckModalTitle().waitForDisplayed({
    timeout: 5000,
    reverse: true,
    timeoutMsg: 'Camera face-check modal did not close.'
  });

  console.log('Camera face-check modal closed.');
});

Then('the merchant should remain on the login screen', async () => {
  await verifyLoginScreen();

  const dashboard = $('android=new UiSelector().text("Alice Ledger")');

  await dashboard.waitForDisplayed({
    timeout: 3000,
    reverse: true,
    timeoutMsg: 'Dashboard appeared when the merchant should remain unauthenticated.'
  });

  console.log('Merchant remains unauthenticated on the login screen.');
});


// MOB-AUTH-03.2: Deny camera permission

When('the merchant denies camera permission', async () => {
  console.log('\n========== CAMERA PERMISSION DENIAL ==========');

  const denyButtons = cameraDenyButtons();

  await driver.waitUntil(
    async () => {
      for (const denyButton of denyButtons) {
        if (await denyButton.isDisplayed()) {
          await denyButton.click();
          console.log('Camera permission denied successfully.');
          return true;
        }
      }

      return cameraAccessAlert().isDisplayed();
    },
    {
      timeout: 15000,
      interval: 500,
      timeoutMsg: 'Neither Android camera permission prompt nor the denied-access alert appeared.'
    }
  );
});

Then('the camera access required alert should be displayed', async () => {
  await cameraAccessAlert().waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Camera access required alert was not displayed.'
  });

  console.log('Camera access required alert displayed.');

  const okButton = $('android=new UiSelector().text("OK")');

  await okButton.waitForDisplayed({ timeout: 5000 });
  await okButton.click();

  console.log('Camera permission alert dismissed.');
});
