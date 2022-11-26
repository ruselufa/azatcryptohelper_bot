const TelegramApi = require('node-telegram-bot-api')
const token = '5968428658:AAEDi1OUv6T599_yKFNTd2FwvTLKGBDEquk'
const chats = {}
const {gameOptions, againOptions} = require('./options')
const bot = new TelegramApi(token, {polling: true})

const startGame = async chatId => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Приветствие'},
        {command: '/info', description: 'Информация'},
        {command: '/game', description: 'Играть'},
    ])
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
    
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/546/9d8/5469d880-28b7-3d63-bf94-0b85993226b6/192/14.webp')
            return bot.sendMessage(chatId, 'Добро пожаловать в телеграм-бот помощник Азата Валеева')
        }
    
        if (text === '/info') {
            return bot.sendMessage(chatId, `Вас зовут ${msg.from.first_name}`)
        }
        
        if (text === '/game') {
            return startGame(chatId)
        }

        return bot.sendMessage(chatId, 'Я тебя не понимаю')
    })
    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === '/again') {
            return startGame(chatId)
        }

        if (data == chats[chatId]) {
            return bot.sendMessage(chatId, `Поздравляю ты угадал цифру ${chats[chatId]}`, againOptions)
        } else {
            return bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions)
        }
    })
}

start ()