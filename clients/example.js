import {createOnebot11Adapter} from '@imhelper/onebot11'
import {createOnebot12Adapter} from '@imhelper/onebot12'
import {createMilkyAdapter} from '@imhelper/milky'
import {createSatoriAdapter} from '@imhelper/satori'
import {createImHelper} from 'imhelper'

const onebot11Adapter = createOnebot11Adapter({
    baseUrl: 'http://localhost:6727/hook/zhin/onebot/v11',
    selfId: 'zhin',
    accessToken: 'your_token',
    receiveMode: 'wss', // ws | wss | webhook (onebot 仅支持这三个)
    path: '/onebot/v11',
})

const onebot12Adapter = createOnebot12Adapter({
    baseUrl: 'http://localhost:6727/hook/zhin/onebot/v12',
    selfId: 'zhin',
    accessToken: 'your_token',
    receiveMode: 'ws', // ws | wss | webhook (onebot 仅支持这三个)
    wsUrl: 'ws://localhost:6727/hook/zhin/onebot/v12',
})

const milkyAdapter = createMilkyAdapter({
    baseUrl: 'http://localhost:6727/hook/zhin/milky/v1',
    selfId: 'zhin',
    accessToken: 'your_token',
    receiveMode: 'sse', // sse | ws | wss | webhook (milky 仅支持这四个)
    sseUrl: 'http://localhost:6727/hook/zhin/milky/v1/events',
})

const satoriAdapter = createSatoriAdapter({
    baseUrl: 'http://localhost:6727/hook/zhin/satori/v1',
    selfId: 'zhin',
    accessToken: 'your_token',
    receiveMode: 'webhook', // (satori 仅支持这个)
    path: '/satori/v1',
})
// 这儿createImHelper后，能根据onebot11Adapter自动推断出，对应的user/group/channel等id的类型
const imHelper = createImHelper(onebot11Adapter)
/**
 * 启动服务，监听 8080 端口
 * 如果adapter是webhook，自动启动/{selfId}/{protocol}/{version}作为webhook地址
 * 如果adapter是ws，自动连接wsUrl
 * 如果adapter是wss，自动启动/{selfId}/{protocol}/{version}作为websocket server地址
 * 如果adapter是sse，自动连接sseUrl
 */
imHelper.start(8080) // 启动服务，监听 8080 端口
// 发送消息
imHelper.sendPrivateMessage('1234567890', 'Hello, world!') // 此处的1234567890应该自动推断出是Id类型，而不是固定的数字或字符串，
// 监听私信
imHelper.on('message.private', (message) => {// 此处应该自动推断出message的类型
    message.reply('Hello, world!')
})
// 监听群消息
imHelper.on('message.group', (message) => {// 此处应该自动推断出message的类型
    message.reply('Hello, world!')
})
// 监听频道消息
imHelper.on('message.channel', (message) => {// 此处应该自动推断出message的类型
    message.reply('Hello, world!')
})