const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();

chromium.use(stealth);

// Configuration, too simple project to use .env

const TG_TOKEN = '';
const CHAT_ID = '';

const USER_DATA_DIR = 'YOUR_DATA_DIR';
const EXECUTABLE_PATH = 'YOUR_PATH'; // If you want to use your own profile / browser

(async () => {
    console.log('Launching parser...');

    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
        executablePath: EXECUTABLE_PATH,
        headless: false,
        args: [
            '--profile-directory=Default',
            '--no-sandbox',
            '--disable-blink-features=AutomationControlled',
        ],
        ignoreDefaultArgs: ['--enable-automation']
    });

    const sendNotify = async (text) => {
        const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(text)}`;
        try {
            const response = await context.request.get(url);
            if (response.ok()) {
                console.log('Notification sent to telegram!');
            } else {
                console.error('Telegram error:', await response.text());
            }
        } catch (e) {
            console.error('Network error:', e.message);
        }
    };

    const page = context.pages()[0] || await context.newPage();

    page.on('response', async (response) => {
        if (response.url().includes('v1/rewards/status?chain=solana')) {
            try {
                const json = await response.json();
                const status = json.data?.signupBonusStatus;
                
                console.log(`[${new Date().toLocaleTimeString()}] Caught response. Status: ${status}`);

                if (status && status !== 'unavailable') {
                    await sendNotify(`THE PROMO IS AVAILABLE! Status: ${status}`);
                }
            } catch (e) { // Ignoring parsing errors
            }
        }
    });

    async function tick() {
        try {
            console.log(`[${new Date().toLocaleTimeString()}] Refreshing page...`);
            
            if (!page.url().includes('trojan.com/account/arena')) {
                await page.goto('https://trojan.com/account/arena', { waitUntil: 'domcontentloaded' });
            } else {
                await page.reload({ waitUntil: 'domcontentloaded' });
            }
        } catch (e) {
            console.error('Refresh error:', e.message);
        } finally {
            setTimeout(tick, 90000);
        }
    }

    await tick();
})();
