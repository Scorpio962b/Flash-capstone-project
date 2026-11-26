import { byText } from '../../support/MobileActions';

export class LoginScreen {
  get signInButton() { return byText('Sign In'); }
  get alertOk() { return $('id=android:id/button1'); }

  // Email and password are prefilled with the demo user in the app
  async loginAsDemoUser() {
    await this.signInButton.waitForDisplayed({ timeout: 30000 });
    await this.signInButton.click();
    await byText('Welcome back').waitForDisplayed({ timeout: 30000 });
    await this.alertOk.click();
  }
}