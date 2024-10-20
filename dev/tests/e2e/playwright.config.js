import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",

	fullyParallel: true,

	forbidOnly: !!process.env.CI,

	// test may sometimes fail due to query params randomization
	// (fails on sql return 0 results)
	retries: 3,

	workers: process.env.CI ? 1 : undefined,

	use: {
		trace: "retain-on-failure",
	},
	reporter: [["html", { open: "never" }]],

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},

		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},

		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
		{
			name: "Mobile Chrome",
			use: { ...devices["Pixel 5"] },
		},
		{
			name: "Mobile Safari",
			use: { ...devices["iPhone 12"] },
		},
	],
});
