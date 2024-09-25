const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('🙌 Hola, ¿Cómo estás?')

const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer("Este es el flujo welcome!", {
        delay: 1000,
        // media: "https://services.meteored.com/img/article/el-tamano-importa-como-el-tamano-de-tu-perro-influye-en-sus-patrones-de-envejecimiento-1698077723860_1024.jpg"
    }, async(ctx, ctxfn) => {
        if (ctx.body.includes('casas')) {
            await ctxfn.flowDynamic('Escribiste casas')
        } else {
            await ctxfn.flowDynamic('Escribiste otra cosa')
        }
    })


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, flowWelcome])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
