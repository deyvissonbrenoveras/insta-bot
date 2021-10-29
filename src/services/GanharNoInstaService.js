require("dotenv").config();
const url = require("url");
const api = require("./api");

class GanharNoInstaService {
  async requestAction(id_contaig, phpSessIdCookie) {
    const form = {
      id_contaig,
      ps: true,
      ar: true,
      pr: true,
      vsys: 2,
    };
    const params = new url.URLSearchParams(form);
    return await api.post("/json/sistema", params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: phpSessIdCookie,
      },
    });
  }
  async confirmAction(id_contaig, idp, idep, phpSessIdCookie) {
    const form = {
      id_contaig,
      ps: true,
      ar: true,
      pr: true,
      vsys: 2,
      idp,
      idep,
    };
    const params = new url.URLSearchParams(form);
    return await api.post("/json/confirmar", params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: phpSessIdCookie,
      },
    });
  }
  async getDoActionsPage(phpSessIdCookie) {
    return await api.get("/painel/?pagina=sistema", {
      headers: {
        Cookie: phpSessIdCookie,
      },
    });
  }
}

module.exports = new GanharNoInstaService();
