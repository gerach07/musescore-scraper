const { chromium } = require('playwright-core');
const chrome = require('chrome-aws-lambda');

export default async function handler(req, res) {
    const { scoreUrl } = req.query;

    if (!scoreUrl) {
        return res.status(400).json({ error: 'Please provide a MuseScore URL' });
    }

    let browser;
    try {
        browser = await chromium.launch({
            args: [...chrome.args, '--font-render-hinting=none'], // Fixes some headless bugs
            executablePath: await chrome.executablePath,
            headless: true,
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        const page = await context.newPage();
        let midiUrl = null;

        // The magic "Network Tab" listener
        page.on('request', request => {
            const url = request.url();
            if (url.includes('.mid') && url.includes('musescore.scoredata')) {
                midiUrl = url;
            }
        });

        const targetUrl = scoreUrl.replace(/\/$/, "") + "/piano-tutorial";
        
        // Navigate and wait for the network to stop moving
        await page.goto(targetUrl, { 
            waitUntil: 'networkidle', 
            timeout: 25000 
        });

        if (midiUrl) {
            res.status(200).json({ midiUrl });
        } else {
            res.status(404).json({ error: 'MIDI not found. Try playing the video on the page first?' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
}