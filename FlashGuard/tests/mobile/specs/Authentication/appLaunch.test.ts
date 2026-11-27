import { driver } from '@wdio/globals';
import describe from "@playwright/test";
import it from "@playwright/test";
import { expect } from '@playwright/test';

describe('MOB-001: FlashGuard App Launch', () => {
    it('should launch and render the application screen successfully', async () => {

        // 1. Verify the application identity
        const currentPackage = await driver.getCurrentPackage();
        const currentActivity = await driver.getCurrentActivity();

        expect(currentPackage).toBe('com.anonymous.flashguadmobileapp');
        expect(currentActivity).toContain('MainActivity');

        // 2. Wait for the Android screen to render meaningful UI content
        await driver.waitUntil(
            async () => {
                const source = await driver.getPageSource();

                return /text="[^"]+"|content-desc="[^"]+"/.test(source);
            },
            {
                timeout: 30000,
                timeoutMsg: 'FlashGuard screen did not display readable UI content'
            }
        );

        // 3. Capture the rendered screen
        const screenSource = await driver.getPageSource();

        // 4. Verify that the screen contains readable content
        expect(
            /text="[^"]+"|content-desc="[^"]+"/.test(screenSource)
        ).toBe(true);

    });
});