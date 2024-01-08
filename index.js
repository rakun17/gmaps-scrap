import * as cheerio from "cheerio";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

async function getGoogleMapsData() {
    puppeteerExtra.use(stealthPlugin());
    const browser = await puppeteerExtra.launch({ headless: false });
    const page = await browser.newPage();
    const query = "coffee shop di cirebon";

    try {
        await page.goto(`https://www.google.com/maps/search/${query.split(" ").join("+")}`);

        async function autoScroll(page) {
            await page.evaluate(async () => {
                const wrapper = document.querySelector('div[role="feed"]');
                await new Promise((resolve, reject) => {
                    let totalHeight = 0;
                    let distance = 1000;
                    let scrollDelay = 3000;

                    let timer = setInterval(async () => {
                        let scrollHeightBefore = wrapper.scrollHeight;
                        wrapper.scrollBy(0, distance);
                        totalHeight += distance;

                        if (totalHeight >= scrollHeightBefore) {
                            // Reset totalHeight
                            totalHeight = 0;

                            // Wait for 3 seconds
                            await new Promise((resolve) => setTimeout(resolve, scrollDelay));

                            // Create a json result
                            let locations = [];
                            const locationItems = document.querySelectorAll('div[role="article"]');
                            locationItems.forEach(locationItem => {
                                const name = locationItem.querySelector('h3').textContent;
                                const rating = locationItem.querySelector('g-rating').firstChild.textContent;
                                const address = locationItem.querySelector('span[role="presentation"]').textContent;
                                locations.push({ name, rating, address });
                            });

                            // Store json data
                            const json = JSON.stringify(locations);
                            console.log(json);

                            // Stop timer
                            clearInterval(timer);
                            resolve();
                        }
                    }, 1000);
                });
            });
        }

        await autoScroll(page);

    } catch (err) {
        console.error(err);
    } finally {
        await browser.close();
    }
}

getGoogleMapsData();