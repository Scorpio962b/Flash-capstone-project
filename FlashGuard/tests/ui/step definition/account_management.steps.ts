import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { UserWorld } from "../../support/World";

interface ManageAccountWorld extends UserWorld {
  page: Page;
}

// Account Profile update

Given(
  "I am logged in and see the homepage",
  async function (this: ManageAccountWorld): Promise<void> {
    await this.page.goto("/login");
    await this.page
      .getByRole("textbox", { name: "Email address" })
      .fill("alice@flashguard.local");
    await this.page
      .getByRole("textbox", { name: "Password" })
      .fill("offline-demo");
    await this.page.getByRole("button", { name: "Sign In" }).click();

    await expect(
      this.page.getByRole("heading", { name: "Portfolio Overview" }),
    ).toBeVisible();
  },
);

When(
  "I select Account Profile",
  async function (this: ManageAccountWorld): Promise<void> {
    await this.page.getByRole("link", { name: /profile/i }).click();
  },
);

When(
  "I update the full name to {string}",
  async function (this: ManageAccountWorld, fullName: string): Promise<void> {
    await this.page.getByRole("textbox", { name: "Fullname" }).fill(fullName);
  },
);

When(
  "I update the email address to {string}",
  async function (this: ManageAccountWorld, email: string): Promise<void> {
    await this.page.getByRole("textbox", { name: "Email" }).fill(email);
  },
);

When(
  "I update the phone number to {string}",
  async function (
    this: ManageAccountWorld,
    phoneNumber: string,
  ): Promise<void> {
    await this.page
      .getByRole("textbox", { name: "Phone Number" })
      .fill(phoneNumber);
  },
);

When(
  "I change the password to {string}",
  async function (this: ManageAccountWorld, password: string): Promise<void> {
    await this.page.getByRole("textbox", { name: "Password" }).fill(password);
  },
);

Then(
  "I should see the profile result {string}",
  async function (
    this: ManageAccountWorld,
    expectedMessage: string,
  ): Promise<void> {
    await expect(this.page.getByRole("status")).toContainText(expectedMessage);
  },
);

// Add Payment Methods

When(
  "I navigate to Payment Methods",
  async function (this: ManageAccountWorld): Promise<void> {
    await this.page.getByRole("link", { name: /Payment Methods/ }).click();
    await expect(
      this.page.getByRole("heading", { name: "Payment Methods" }),
    ).toBeVisible();
  },
);

When(
  "I add a payment method with card number {string}",
  async function (this: ManageAccountWorld, cardNumber: string): Promise<void> {
    await this.page.getByRole("button", { name: /Add Payment Method/ }).click();
    await this.page
      .getByPlaceholder("Card Number (16 digits)")
      .fill(cardNumber);
  },
);

When(
  "I enter the payment nickname {string}",
  async function (this: ManageAccountWorld, nickname: string): Promise<void> {
    await this.page.getByPlaceholder("Nickname (e.g., My Visa)").fill(nickname);
  },
);

When(
  "I enter the card expiry date {string}",
  async function (this: ManageAccountWorld, expiryDate: string): Promise<void> {
    await this.page.getByPlaceholder("Expiry Date (MM/YY)").fill(expiryDate);
  },
);

When(
  "I enter the card CVV {string} and submit it",
  async function (this: ManageAccountWorld, cvv: string): Promise<void> {
    await this.page.getByPlaceholder("CVV").fill(cvv);
    await this.page.getByRole("button", { name: "Add Card" }).click();
  },
);

Then(
  "I should see the payment method result {string}",
  async function (
    this: ManageAccountWorld,
    expectedMessage: string,
  ): Promise<void> {
    await expect(this.page.getByRole("status")).toContainText(expectedMessage);
  },
);
