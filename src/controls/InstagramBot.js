require("dotenv").config();
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const userAgent = require("user-agents");
const actionTypeEnum = require("../util/actionTypeEnum");

puppeteer.use(pluginStealth());

class InstagramBot {
  NETWORKIDLE = "networkidle0";
  browser;
  page;

  constructor(user, password) {
    return (async () => {
      await this.initializePuppeteer();
      await this.logon(user, password);
      return this;
    })();
  }
  async initializePuppeteer() {
    console.log("Iniciando o bot do instagram");
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();
  }
  async logon(user, password) {
    console.log("Logando no instagram com o usuário " + this.user);
    await this.page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );
    await this.page.goto(this.buildUrl(""), { waitUntil: this.NETWORKIDLE });
    await this.page.type("input[name=username]", user);
    await this.page.type("input[name=password]", password);
    await this.page.click("button[type=submit]");
    await this.page.waitForNavigation({ waitUntil: this.NETWORKIDLE });
    console.log("Logado com sucesso");
    await this.avoidTurOnNotifications();
  }
  doAction(action) {
    switch (action.type) {
      case actionTypeEnum.FOLLOW:
        this.followUser(action.url);
        break;
      case actionTypeEnum.LIKE:
        this.likePost(action.url);
        break;
    }
  }
  async followUser(url) {
    console.log("Checking if " + url + " is already followed");
    await this.page.goto(url, {
      waitUntil: this.NETWORKIDLE,
    });
    try {
      const followingSpan = await this.page.waitForSelector(
        'span[aria-label="Following"]',
        { timeout: 1000 }
      );
      if (followingSpan) {
        console.log(url + " is already being followed");
      }
    } catch (e) {
      await this.page.click(
        'button[class="_5f5mN       jIbKX  _6VtSN     yZn4P   "',
        {
          waitUntil: this.NETWORKIDLE,
        }
      );
      console.log(url + " followed");
    }
  }
  async likePost(url) {
    await this.page.goto(url, {
      waitUntil: this.NETWORKIDLE,
    });
    await this.page.click(
      'section[class="ltpMr  Slqrh"] button[class="wpO6b  "]',
      {
        waitUntil: this.NETWORKIDLE,
      }
    );
  }
  async avoidTurOnNotifications() {
    try {
      const notNowButton = await this.page.waitForSelector(
        'button[class="aOOlW   HoLwm "]',
        { timeout: 1000 }
      );
      if (notNowButton) {
        await this.page.click('button[class="aOOlW   HoLwm "', {
          waitUntil: this.NETWORKIDLE,
        });

        console.log("Turn On Notifications Modal was avoided");
      }
    } catch (e) {
      console.log("Turn On Notifications Modal was not shown, continuing...");
    }
  }
  buildUrl(userProfile) {
    return process.env.INSTA_URL + userProfile;
  }
}

module.exports = { InstagramBot };
