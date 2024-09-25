const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require("dotenv").config()
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const path = require('path')
const fs = require('fs')
const chat = require('./chatGPT')

const menuPath = path.join(__dirname, 'messages', 'menu.txt')
const menu = fs.readFileSync(menuPath, 'utf8')

const flowMenuRest = addKeyword(EVENTS.ACTION).addAnswer(
  '🙌 Este es el menú', {
    media: "https://www.fratellinos.com/wp-content/uploads/2021/01/Childrens2021.pdf"
  }
)

const flowReservar = addKeyword(EVENTS.ACTION).addAnswer(
  '🙌 Esta es la opción reservar https://rodyhuancas.vercel.app/',
)

const flowConsultas = addKeyword(EVENTS.ACTION)
  .addAnswer('🙌 Esta es la opción de consultas')
  .addAnswer('Haz una consulta', { capture: true }, async (ctx, ctxfn) => {
    const prompt = 'Tu respuesta es: '
    const consulta = ctx.body
    const answer = await chat(prompt, consulta)
    console.log(answer.content)
    // return ctxfn.flowDynamic(answer)
  })

const flowWelcome = addKeyword(EVENTS.WELCOME).addAnswer(
  'Este es el flujo welcome!',
  {
    delay: 1000,
    // media: "https://services.meteored.com/img/article/el-tamano-importa-como-el-tamano-de-tu-perro-influye-en-sus-patrones-de-envejecimiento-1698077723860_1024.jpg"
  },
  async (ctx, ctxfn) => {
    if (ctx.body.includes('casas')) {
      await ctxfn.flowDynamic('Escribiste casas')
    } else {
      await ctxfn.flowDynamic('Escribiste otra cosa')
    }
  },
)

const menuFlow = addKeyword(['menu', 'opciones', 'menú']).addAnswer(
  menu,
  { capture: true },
  async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
    if (!['1', '2', '3', '0'].includes(ctx.body)) {
      return fallBack(
        'Respuesta no válida, por favor selecciona una opción del menú',
      )
    }

    switch (ctx.body) {
      case '1':
        return gotoFlow(flowMenuRest)
      case '2':
        return gotoFlow(flowReservar)
      case '3':
        return gotoFlow(flowConsultas)
      case '0':
        return await flowDynamic(
          "Saliendo... Puedes volver a acceder escribiendo *'menú'*",
        )
    }
  },
)

const main = async () => {
  const adapterDB = new MockAdapter()
  const adapterFlow = createFlow([
    flowMenuRest,
    flowReservar,
    flowConsultas,
    flowWelcome,
    menuFlow,
  ])
  const adapterProvider = createProvider(BaileysProvider)

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  QRPortalWeb()
}

main()
