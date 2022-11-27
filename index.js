const TelegramApi = require('node-telegram-bot-api')
const token = '5968428658:AAEDi1OUv6T599_yKFNTd2FwvTLKGBDEquk'
const chats = {}
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')
const bot = new TelegramApi(token, {polling: true})

const startGame = async chatId => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (err) {
        console.log('Подключение к БД сломалось', err)
    }

    bot.setMyCommands([
        {command: '/start', description: 'Приветствие'},
        {command: '/info', description: 'Информация'},
        {command: '/game', description: 'Играть'},
    ])
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        
        try {
            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/546/9d8/5469d880-28b7-3d63-bf94-0b85993226b6/192/14.webp')
                return bot.sendMessage(chatId, 'Добро пожаловать в телеграм-бот помощник Азата Валеева')
            }
        
            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Вас зовут ${msg.from.first_name}, в игре у тебя правильных ответов - ${user.right}, неправильных - ${user.wrong}`)
            }
            
            if (text === '/game') {
                return startGame(chatId)
            }
    
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз')
        } catch (error) {
            return bot.sendMessage(chatId, 'Произошла какая-то ошибочка!')
        }

    })
    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const user = await UserModel.findOne({chatId})

        if (data === '/again') {
            return startGame(chatId)
        }
        
        if (data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Поздравляю ты угадал цифру ${chats[chatId]}`, againOptions)
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `К сожалению ты не угадал, бот загадал цифру ${chats[chatId]}`, againOptions)
        }
        await user.save()
    })
}

start ()