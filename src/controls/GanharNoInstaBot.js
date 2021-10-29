require("dotenv").config();
const parse = require("node-html-parser").parse;
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const NETWORK_IDLE = require("../util/networkStatusEnum").NETWORK_IDLE;
const actionTypeEnum = require("../util/actionTypeEnum");

const ganharNoInstaService = require("../services/GanharNoInstaService");

puppeteer.use(pluginStealth());

class GanharNoInstaBot {
  browser;
  page;
  phpSessCookie;
  constructor() {
    return (async () => {
      await this.initializePuppeteer();
      return this;
    })();
  }

  async initializePuppeteer() {
    console.log("Iniciando o bot Ganhar no Insta");
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();
  }

  async logon() {
    console.log(
      "Logando no Ganhar no Insta com o usuário " +
        process.env.GANHAR_NO_INSTA_EMAIL
    );
    await this.page.goto(this.buildUrl("painel"), {
      waitUntil: NETWORK_IDLE,
    });
    await this.page.type("#uname", process.env.GANHAR_NO_INSTA_EMAIL);
    await this.page.type("#pwd", process.env.GANHAR_NO_INSTA_PASSWORD);
    await this.page.click("button[type=submit]");
    await this.page.waitForNavigation({ waitUntil: this.NETWORKIDLE });
    this.phpSessCookie = await this.getPhpSessIdCookie();
    console.log("Logado com sucesso");
  }
  async getPhpSessIdCookie() {
    console.log("Capturando sessão");
    const cookies = await this.page.cookies();
    const phpSessIdCookie = cookies.filter((cookie) =>
      cookie.name.includes("PHPSESSID")
    )[0];
    return `${phpSessIdCookie.name}=${phpSessIdCookie.value}`;
  }

  buildUrl(route) {
    return process.env.GANHAR_NO_INSTA_URL + route;
  }
  async requestAction(id_contaig) {
    console.log("Requisitando uma nova ação");
    const response = await ganharNoInstaService.requestAction(
      id_contaig,
      this.phpSessCookie
    );
    const { idp, idep, html } = response.data;
    const action = this.parseActionHtml(html);
    return { idp, idep, action };
  }
  async confirmAction(id_contaig, idp, idep) {
    console.log("Confirmando ação anterior e requisitando uma nova");
    const response = await ganharNoInstaService.confirmAction(
      id_contaig,
      idp,
      idep,
      this.phpSessCookie
    );
    const { idp: newIdp, idep: newIdep, html } = response.data;
    const action = this.parseActionHtml(html);
    return { idp: newIdp, idep: newIdep, action };
  }
  parseActionHtml(html) {
    let type = "";
    if (html.includes("Tarefas Esgotadas")) {
      return null;
    }
    if (html.includes("Seguir Perfil")) {
      type = actionTypeEnum.FOLLOW;
    } else if (html.includes("Curtir Publicação")) {
      type = actionTypeEnum.LIKE;
    }
    const parsedHtml = parse(html);
    const url = parsedHtml.querySelector("#btn-acessar").attributes.href;
    return { type, url };
  }
  async getAvailableUsers() {
    const response = await ganharNoInstaService.getDoActionsPage(
      this.phpSessCookie
    );
    return this.parseAccountsFromDoActionsPage(String(response.data));
  }
  parseAccountsFromDoActionsPage(html) {
    const parsedHtml = parse(html, { blockTextElements: { script: true } });
    const selectContaIg = parsedHtml.querySelector("#contaig").childNodes;
    selectContaIg.shift();
    selectContaIg.shift();
    const accounts = selectContaIg.map((node) => ({
      account: node.text,
      id: node.attributes.value,
    }));
    return accounts;
  }
}

module.exports = { GanharNoInstaBot };
