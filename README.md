# Cryptocurrency-crypto-bot-cryptobreedables - Second layer bot for Cryptocurrency-crypto-bot
Cryptobreedables is a text and image based driven Discord game. Its as easy as it sounds. All actions can be done by reacting to the bot messages by clicking the emoji icons given on the events. You can fight, level up, collect nice items and earn free crypto coins.

---

**This bot is fully functional and ready to use but it only works if Cryptocurrency-crypto-bot is installed as first layer and this bot as second layer.**  


*#* Preview pictures are located in the folder "preview" of this repo. *#*

---

### CRYPTOBREEDABLES BOT COMMANDS
> ```+me```  
Display your game stats and link.  
```+gift <@username> <box|divineshield|lifeincreasepotion|healpotion> <amount>```  
Send a item(s) as gift to another user.  
```+use <box|lifeincreasepotion|healpotion|egg>```  
Use the selected item.  
```+rez```  
If you are dead you can use this command to revive yourself. (Please check the #faq for costs of this command)  
```+activate <item type> <item ID>```  
Activate/Change item by type and id for the battle. Type +me to get your profile link to check your items.  
```+claim```  
Claim a free box every 24 hours.  
```+jackpot```  
Show the current jackpot information.  
```+top```  
Show top 10 players.  
```+cversion```  
Display current bot version.  

### CRYPTOBREEDABLES BOT ADMIN COMMANDS
> ``` +battle <monster life points>```   
Start a new monster battle.  
``` +destroy```   
Destroy current monster battle.  
``` +gift <@username> <box|divineshield|lifeincreasepotion|healpotion|egg|life|protection> <amount>```   
Send a item as gift to another user.  
``` +cstart / +cstop```   
Enable/Disable cryptobreedables bot commands while the bot is running.  
``` +kill```   
Kill the current bot process.  
``` +lock <on/off/list/reset> <@username>```   
Lock or unlock a user from blocklist commands. Show or reset blocklist users.  
``` +summary <days as number>```   
Show total game payouts and incomes of last requested days.  
``` +shop <normal/special>```   
Open shop for users to buy itemas. (special and rare not active right now)  

### Additional information
- It supports all coins using the standard Bitcoin rpc commands  
- Written for Node.js  
- The bot offers the option to enable or disable all commands seperated, so its not needed to use them all  
- The backend is a mysql database  
- A massive configuration file to manage all content from one file  
- You can define administrators, moderators and a vip group  
... and many many many more options, please check the config file  

## Installation
1. Create a MySQL Database and import the cryptocurrency-crypto-bot.sql (IF YOU DID THIS ALREADY FOR THE BASE BOT YOU DO NOT NEED THIS STEP! THE DATABASE IS ALREADY READY FOR THE GAME.)  
2. Upload the website folder to your host and edit the config.php <- The website is needed as parts of the game are using the api
3. Add all FOLDER: discord_emojis to your discord server:  
```:claws:, :firestorm:, :blizzard:, :reddragon:, :blackdragon:, :hf:, :hh:, :he:, :egg:, :blood:, :cbdragon:, :dead:, :rez:, :sword:, :divineshield:, :explode:, :box:, :star:, :levelup:, :potion_green:, :potion_red:, :jackpot:, :profile:, :monster:, and your coin icon```
4. Edit the config file of this bot carefully without missing any needed value! Dont forget to replace all emojis ids with the ones from your discord server.
5. Start your bot and enjoy! -> node index.js  
6. Use the #FAQ file to create a information channel for your discord users.  

## Projects using the bot - Feel free to contact me to get added
- Limitless (VIP) - Discord: https://discord.gg/wtz6QYX - Website: http://vip.limitlessvip.co.za/
