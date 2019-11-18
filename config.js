module.exports = {
  bot: {
    version: "1.12.12", // Current bot version
    adminMode: false, // If enabled the bot only accepts commands from admins
    errorLogging: true, // Enable error logging to file cryptobreedables_error.log
    errorLoggingMaxFileSize: 5242880, // filesize in bytes
    errorLoggingMaxBackups: 5, // How many backup files to hold
    errorLoggingZipOldLogs: true, // After reaching max file zip old logs
    gameLogging: true, // Enable error logging to file cryptobreedables_error.log
    gameLoggingMaxFileSize: 5242880, // filesize in bytes
    gameLoggingMaxBackups: 5, // How many backup files to hold
    gameLoggingZipOldLogs: true, // After reaching max file zip old logs
    commandPrefix: "!", // Bot prefix to trigger the bot <- if symbol changed it needs to get allowed on check.js
    cooldownTime: 5, // Cooldown a user need to wait between commands in seconds
    coinName: "CoinName",
    coinSymbol: "Symbol", // e.g. BTC
    botID: "XXX", // Bot ID - important else it react to own messages -> SAME AS FOR BASE BOT!
    adminIDs: ["XXX"], // This users IDs are able to use admin commands and bypass cooldowns -> SAME AS FOR BASE BOT!
    moderatorIDs: ["XXX","XXX"], // This users IDs are able to use moderator commands and bypass cooldowns
    vipGroupName: "Cryptobreedables VIP", // This Group users are able to use vip commands and bypass cooldowns
    mentionGroup: "XXX", // Users joining this group (DISCORD GROUP ID) by command get mentioned on bot fights if mention command is enabled
    respondChannelIDs: ["XXX"], // Discord server channels IDs the bot does listen to and spawns battles and shops
    allowDM: true, // Allow or disable direct messages for commands to the bot with true or false
    botToken: "XXX", // Discord bot token -> SAME AS FOR BASE BOT!
    websiteApiKey: "12Cryptobreedables34",
    websiteCreateImgLink: "https://domain.link/api/create_pet_image.php", // parameters on create image function
    websiteImgLink: "https://domain.link/tmp/", // image + extenxion needs to get added
    websiteIcon: "https://domain.link/images/favicons/favicon-32x32.png",
    websiteLink: "domain.link",
    websiteUserProfile: "https://domain.link/u/cryptobreedables/",
    commandIgnor: ["register","r","profile","p","balance","b","deposit","d","withdraw","w","stake","unstake","tip","rain","drop","history","update",,"donate","notify","version","start","stop","getdeposits","gd","creditdeposits","cd","getstakes","gs","creditstakes","cs","clear","c"] // commands to ignor because of other bots
  },
  mysql: {
    // Dont forget to import the empty database before starting the bot
    dbHost: "XXX", // Database server
    dbName: "XXX", // Database name
    dbUser: "XXX", // Database user
    dbPassword: "XXX", // Database password
    dbPort: 3306, // Database port
    connectionLimit: 20, // Database maximal database pool connections
    waitForConnections: true // If true, the pool will queue the connection request and call it when one becomes available
  },
  backup: {
    enabled: true,
    cronTime: 3600, // Backup time in seconds
    deleteOld: true, // If enabled old backup files get deleted
    deleteTime: 432000, // Files older x(defined number) seconds get deleted
    deleteCronTime: 3000, // Cron fire time in seconds
  },
  ftpupload: { // This is for the webstats if the page is hosted
    enabled: true,
    cronTime: 60, // Backup time in seconds
    host: "XXX",
    user: "XXX",
    password: "XXX",
    port: "21",
    filepath: "/lowdb/lowdb.json",
    destpath: "domain.link/data/cryptobreedables/lowdb.json"
  },
  commands: {
    // Enable or disable commands -> true/false
    // Admin commands
    startstop: true,
    battle: true,
    destroy: true,
    shop: true,
    summary: true,
    kill: true,
    lock: true,
    // Normal commands
    activate: true,
    version: true,
    help: true,
    rez: true,
    me: true,
    top: true,
    gift: true,
    use: true,
    jackpot: true,
    mention: true,
    claim: true
  },
  colors: {
    normal: "0xecf0f1", // grey
    success: "0x2ecc71", // green
    warning: "0xe67e22", // orange
    error: "0xe74c3c", // red
    special: "0xE91E63", // pink
    blue: "0x3498db", // blue
    black: "0x000000", // black
    white: "0xffffff", // white
    yellow: "0xFFCC00" // yellow
  },
  shop: {
    cron: {
      enabled: true,
      randomShopStartTime: 1200,
      possibleShops: ['normal','special'],
    },
    normal: {
      roundTime: 10, // Time in seconds for each round
      totalRounds: 2, // How often the shop refresh so it always stays on bottom of chat
      shopIcons: { // Same Items need to be added to messages with the same key!
        box: "573913085732061204",
        potion_red: "575424030497308672",
        potion_green: "575423922200379432",
        divineshield: "573187067807268874",
        //egg: "573069966119665689",
      },
      img: "shop_normal.png"
    },
    special: {
      roundTime: 10, // Time in seconds for each round
      totalRounds: 2, // How often the shop refresh so it always stays on bottom of chat
      shopIcons: { // Same Items need to be added to messages with the same key!
        reddragon: "613280949517680641",
        blackdragon: "613280856160862238",
        egg: "573069966119665689",
      },
      img: "shop_special.png"
    },
    rare: {
      img: "shop_rare.png"
    },
    shopCosts: {
      realPrices: { // If enabled the defined prices are cent prices calculated to the used coin // IMPORTANT!! -> The cron 'coinPrice' on the main bot has to be enabled to make this option working
        enabled: true,
        cronTime: 300, // Cron time in seconds
      },
      box: 5,
      potion_red: 1, 
      potion_green: 1,
      divineshield: 2,
      reddragon: 20,
      blackdragon: 25,
      egg: 100,
    },
    jackpot: {
      enabled: true,
      percentage: 10
    },
    chatIcons: {
      coins: "<:galilel_logo_white:582647716971020318>",
      jackpot: "<:jackpot:584674195917635605>"
    },
  },
  battle: {
    cron: {
      enabled: true,
      randomBattleStartTime: 300,
      monsterHealth:{
        min: 8000,
        max: 18000
      },
      autoHealth:{
        enabled: true,
        value: 100
      }
    },
    minLifePoints: 0  , // Minimum life points a monster must have
    startRound: 1, // Round number the battle starts with -> normally 0 ;)
    endRound: 16, // Round numver the battle ends
    roundTime: 10, // Time in seconds for each round
    attackIcons: {
        sword: "573140874867900440"
    },
    chatIcons: {
      sword: "<:sword:573140874867900440>",
      coins: "<:galilel_logo_white:582647716971020318>",
      jackpot: "<:jackpot:584674195917635605>",
      box: "<:box:573913085732061204>",
      egg: "<:egg:573069966119665689>",
      divineShield: "<:divineshield:573187067807268874>",
      lifeIncreasePotion: "<:potion_red:575424030497308672>",
      healPotion: "<:potion_green:575423922200379432>",
    },
    lifeIcons: {
      fullHeart: "<:hf:572082464189841408>",
      halfHeart: "<:hh:572135645523476491>",
      emptyHeart: "<:he:572135668495679498>"
    },
    triggerExp: {
      min: 4,
      max: 6
    },
    triggerFailExp: {
        min: 2,
        max: 3
    },
    triggerItemExp: {
      min: 4,
      max: 6
    },
    triggerItemFailExp: {
        min: 2,
        max: 3
    },
    triggerKillExp: {
      min: 8,
      max: 10
    },
    victory_img: "victory.png",
    defense_img: "defense.png",
    rain: { // Rain to users after each round (values divided by end round count)
      chance: 100,
      min: 0.07,
      max: 0.12,
      floating: 8 // Define floating points for min and max value
    },
    drop: {
      chance: 100,
      itemList: ['egg','box','divineshield','lifeincreasepotion','healpotion','healpotion','healpotion','healpotion','healpotion']
    }
  },
  level: {
    chatIcons: {
      levelUp: "<:levelup:574363093443018752>",
    }
  },
  me:{
    chatIcons: {
      levelUp: "<:levelup:574363093443018752>",
      fullHeart: "<:hf:572082464189841408>",
      box: "<:box:573913085732061204>",
      divineShield: "<:divineshield:573187067807268874>",
      egg: "<:egg:573069966119665689>",
      lifeIncreasePotion: "<:potion_red:575424030497308672>",
      healPotion: "<:potion_green:575423922200379432>",
      dead: "<:dead:573134665448161299>",
      sword: "<:sword:573140874867900440>",
      profile: "<:profile:609438101538078720>"
    }
  },
  rez: {
    enabled: true, // Disable if rez should be free of charge
    chatIcons: {
      fullHeart: "<:hf:572082464189841408>",
      rez: "<:rez:573134737153982464>",
      coins: "<:galilel_logo_white:582647716971020318>"
    },
    costs: 0.2
  },
  use: {
    chatIcons: {
      box: "<:box:573913085732061204>",
      levelUp: "<:levelup:574363093443018752>",
      egg: "<:egg:573069966119665689>",
      divineShield: "<:divineshield:573187067807268874>",
      lifeIncreasePotion: "<:potion_red:575424030497308672>",
      healPotion: "<:potion_green:575423922200379432>",
      fullHeart: "<:hf:572082464189841408>",
      coins: "<:galilel_logo_white:582647716971020318>",
      jackpot: "<:jackpot:584674195917635605>"
    },
    box:{
      exp: {
        chance: 100,
        min: 4,
        max: 8
      },
      life: {
        chance: 40,
        min: 200,
        max: 500
      }, 
      protection: {
        chance: 40,
        min: 20,
        max: 30
      }, 
      divineshield: {
        chance: 40
      }, 
      lifeincreasepotion: {
        chance: 5
      }, 
      healpotion:{
        chance: 15
      },
      box: {
        chance: 10
      }, 
      coins: {
        chance: 100,
        min: 0.05,
        max: 0.15,
        floating: 8 // Define floating points for min and max value
      }, 
      jackpot: {
        chance: 2,
        min: 50,
        max: 80
      }
    },
    lifeincreasepotion:{
      min: 2,
      max: 4
    },
    healpotion:{
      min: 50,
      max: 100
    },
    egg:{
      possiblePets: ["dragon"]
    }
  },
  activate:{
    possiblePets: ["dragon","reddragon","blackdragon"]
  },
  jackpot: {
    chatIcons: {
      jackpot: "<:jackpot:584674195917635605>",
      coins: "<:galilel_logo_white:582647716971020318>"
    }
  },
  top: {
    displayCount: 10,
    chatIcons: {
      title: "<:star:574358215660404746>",
      place1: ":one:",
      place2: ":two:",
      place3: ":three:",
      place4: ":four:",
      place5: ":five:",
      place6: ":six:",
      place7: ":seven:",
      place8: ":eight:",
      place9: ":nine:",
      place10: ":keycap_ten:",
      fail: ":x:",
      levelUp: "<:levelup:574363093443018752>",
      fullHeart: "<:hf:572082464189841408>",
      box: "<:box:573913085732061204>",
      divineShield: "<:divineshield:573187067807268874>",
      egg: "<:egg:573069966119665689>",
      lifeIncreasePotion: "<:potion_red:575424030497308672>",
      healPotion: "<:potion_green:575423922200379432>"
    }
  },
  monster: {
    triggerChance: 10,
    triggerDamage: {
        min: 212,
        max: 322
    },
    chatIcons: {
      fullHeart: "<:hf:572082464189841408>",
      blood: "<:blood:573070011032141835>",
      dead: "<:dead:573134665448161299>"
    },
    img: {
      name: "monster",
      numberFrom: 1,
      numberTo: 18
    }
  },
  items:{
    dragon: {
      name: 'Dragon',
      description: 'Little dragon pet that supports you while fighting.',
      level: 0,
      exp: 0,
      shine: {
        standard: 0,
        chance: 5,
        from: 0.01,
        to: 1
      },
      glow: {
        standard: 0,
        chance: 3,
        from: 0.01,
        to: 1
      },
      gen: 0,
      damage: 40,
      critDamage: {
        chance: 8,
        multiplier:{
          from: 2,
          to: 4
        }
      },
      triggerChance:  70,
      levelMultiplier1 : 25,
      levelMultiplier2 : 50,
      levelMultiplier3 : 75,
      levelMultiplierSmallerEqual1: 2,
      levelMultiplierBigger1SmallerEqual2: 3,
      levelMultiplierBigger2SmallerEqual3: 4,
      levelMultiplierBigger3: 5,
      randomPlusMinusPercentage: {
        from: 1,
        to: 10
      },
      attacks: [["Claws cut","<:claws:613331099854307350>"]],
      chatIcons: {
        dragon: "<:cbdragon:573070058797006850>"
      }
    },
    reddragon: {
      name: 'Red dragon',
      description: 'Red dragon pet that supports you while fighting.',
      level: 0,
      exp: 0,
      damage: 20,
      critDamage: {
        chance: 8,
        multiplier:{
          from: 2,
          to: 3
        }
      },
      triggerChance:  50,
      levelMultiplier1 : 25,
      levelMultiplier2 : 50,
      levelMultiplier3 : 75,
      levelMultiplierSmallerEqual1: 2,
      levelMultiplierBigger1SmallerEqual2: 3,
      levelMultiplierBigger2SmallerEqual3: 4,
      levelMultiplierBigger3: 5,
      randomPlusMinusPercentage: {
        from: 1,
        to: 8
      },
      attacks: [["Firestorm","<:firestorm:613305123598368768>"],["Fire blast","<:firestorm:613305123598368768>"],["Ember","<:firestorm:613305123598368768>"]],
      chatIcons: {
        reddragon: "<:reddragon:613280949517680641>"
      }
    },
    blackdragon: {
      name: 'Black dragon',
      description: 'Black dragon pet that supports you while fighting.',
      level: 0,
      exp: 0,
      damage: 20,
      critDamage: {
        chance: 8,
        multiplier:{
          from: 2,
          to: 3
        }
      },
      triggerChance:  50,
      levelMultiplier1 : 25,
      levelMultiplier2 : 50,
      levelMultiplier3 : 75,
      levelMultiplierSmallerEqual1: 2,
      levelMultiplierBigger1SmallerEqual2: 3,
      levelMultiplierBigger2SmallerEqual3: 4,
      levelMultiplierBigger3: 5,
      randomPlusMinusPercentage: {
        from: 1,
        to: 8
      },
      attacks: [["Blizzard","<:blizzard:613305091276931082>"],["Ice beam","<:blizzard:613305091276931082>"]],
      chatIcons: {
        blackdragon: "<:blackdragon:613280856160862238>"
      }
    },
    divineShield: { 
      name: "Divine shield",
      description: "Protects players from the attack of monsters.",
      calculation: "",
      trigger_chance: 80,
      protectRemove: {
        min: 8,
        max: 12
      },
      totalHealth: 100,
      maxItems: 5,
      chatIcons: {
        divineShield: "<:divineshield:573187067807268874>",
        destroyed: "<:explode:573217020460531725>"
      },
    },
    healPotion: {
      maxItems: 8,
    },
    attack: {
      name: "Player attack",
      description: "Attack the monster and do damage based on your level and items you own.",
      calculation: "damage+=level*1.2 <=> level 25 => damage+=level*1.4 <=> level 50 => damage+=level*1.6 <=> level 75 => damage+=level*1.8",
      damage: 60,
      critDamage: {
        chance: 10,
        multiplier:{
          from: 2,
          to: 3
        }
      },
      triggerChance: 80,
      levelMultiplier1 : 25,
      levelMultiplier2 : 50,
      levelMultiplier3 : 75,
      levelMultiplierSmallerEqual1: 2,
      levelMultiplierBigger1SmallerEqual2: 3,
      levelMultiplierBigger2SmallerEqual3: 4,
      levelMultiplierBigger3: 5,
      randomPlusMinusPercentage: {
        from: 1,
        to: 10
      },
    }
  },
  claim:{
    minLevel: 13, // min level that is needed for claim
    daysBetween: 1 // how many days between claim
  },
  startUser: {
    level: 0,
    exp: 0,
    health: 2000,
    rezHealth: 2000,
    death: 0,
    kills: 0,
    items: {
      lifeIncreasePotions: 0,
      healPotions: 0,
      eggs: 0,
      boxes: 5,
      divineShield: {
        count: 5,
        health: 100
      },
    },
    attackItems: {
    }
  },
  userLevel: {"1":"76","2":"153","3":"231","4":"310","5":"390","6":"472","7":"555","8":"638","9":"723","10":"809","11":"897","12":"985","13":"1075","14":"1166","15":"1258","16":"1351","17":"1445","18":"1541","19":"1638","20":"1736","21":"1836","22":"1937","23":"2039","24":"2143","25":"2247","26":"2354","27":"2461","28":"2570","29":"2680","30":"2792","31":"2905","32":"3020","33":"3136","34":"3253","35":"3372","36":"3492","37":"3614","38":"3737","39":"3862","40":"3988","41":"4116","42":"4245","43":"4376","44":"4509","45":"4643","46":"4779","47":"4916","48":"5055","49":"5196","50":"5338","51":"5482","52":"5628","53":"5775","54":"5924","55":"6075","56":"6228","57":"6383","58":"6539","59":"6697","60":"6857","61":"7019","62":"7182","63":"7348","64":"7515","65":"7685","66":"7856","67":"8029","68":"8205","69":"8382","70":"8561","71":"8742","72":"8926","73":"9111","74":"9299","75":"9489","76":"9680","77":"9874","78":"10071","79":"10269","80":"10470","81":"10672","82":"10878","83":"11085","84":"11295","85":"11507","86":"11721","87":"11938","88":"12157","89":"12379","90":"12603","91":"12830","92":"13059","93":"13290","94":"13525","95":"13761","96":"14001","97":"14243","98":"14487","99":"14735","100":"14985","101":"15237","102":"15493","103":"15751","104":"16012","105":"16276","106":"16543","107":"16813","108":"17086","109":"17362","110":"17640","111":"17922","112":"18207","113":"18495","114":"18786","115":"19080","116":"19377","117":"19678","118":"19982","119":"20289","120":"20599","121":"20913","122":"21230","123":"21551","124":"21875","125":"22202","126":"22533","127":"22868","128":"23206","129":"23548","130":"23894","131":"24243","132":"24596","133":"24953","134":"25314","135":"25678","136":"26047","137":"26419","138":"26795","139":"27175","140":"27560","141":"27948","142":"28341","143":"28738","144":"29139","145":"29545","146":"29955","147":"30369","148":"30787","149":"31210","150":"31638","151":"32070","152":"32507","153":"32948","154":"33394","155":"33845","156":"34301","157":"34761","158":"35227","159":"35697","160":"36173","161":"36653","162":"37139","163":"37630","164":"38126","165":"38627","166":"39133","167":"39645","168":"40163","169":"40686","170":"41214","171":"41749","172":"42288","173":"42834","174":"43385","175":"43943","176":"44506","177":"45075","178":"45650","179":"46232","180":"46819","181":"47413","182":"48013","183":"48619","184":"49232","185":"49852","186":"50478","187":"51111","188":"51750","189":"52396","190":"53049","191":"53709","192":"54376","193":"55051","194":"55732","195":"56420","196":"57116","197":"57820","198":"58530","199":"59249","200":"59975","201":"60708","202":"61450","203":"62199","204":"62957","205":"63722","206":"64496","207":"65278","208":"66068","209":"66866","210":"67673","211":"68489","212":"69313","213":"70147","214":"70989","215":"71840","216":"72700","217":"73569","218":"74447","219":"75335","220":"76232","221":"77139","222":"78056","223":"78982","224":"79918","225":"80864","226":"81821","227":"82787","228":"83764","229":"84751","230":"85749","231":"86757","232":"87776","233":"88806","234":"89847","235":"90899","236":"91962","237":"93037","238":"94123","239":"95221","240":"96331","241":"97452","242":"98585","243":"99731","244":"100888","245":"102058","246":"103241","247":"104436","248":"105644","249":"106865","250":"108099","251":"109346","252":"110607","253":"111881","254":"113168","255":"114470","256":"115785","257":"117115","258":"118458","259":"119816","260":"121189","261":"122576","262":"123978","263":"125396","264":"126828","265":"128276","266":"129739","267":"131218","268":"132713","269":"134224","270":"135751","271":"137294","272":"138854","273":"140431","274":"142025","275":"143635","276":"145263","277":"146909","278":"148572","279":"150253","280":"151953","281":"153670","282":"155406","283":"157161","284":"158934","285":"160727","286":"162538","287":"164370","288":"166221","289":"168092","290":"169983","291":"171894","292":"173826","293":"175779","294":"177753","295":"179748","296":"181764","297":"183802","298":"185863","299":"187945","300":"190050","301":"192178","302":"194328","303":"196502","304":"198699","305":"200920","306":"203165","307":"205434","308":"207727","309":"210046","310":"212389","311":"214758","312":"217152","313":"219572","314":"222018","315":"224491","316":"226990","317":"229517","318":"232070","319":"234652","320":"237261","321":"239898","322":"242564","323":"245259","324":"247983","325":"250737","326":"253520","327":"256333","328":"259177","329":"262051","330":"264957","331":"267894","332":"270863","333":"273864","334":"276898","335":"279964","336":"283064","337":"286197","338":"289364","339":"292566","340":"295802","341":"299073","342":"302380","343":"305723","344":"309102","345":"312517","346":"315970","347":"319460","348":"322988","349":"326554","350":"330159","351":"333804","352":"337487","353":"341211","354":"344975","355":"348780","356":"352627","357":"356515","358":"360445","359":"364418","360":"368435","361":"372495","362":"376599","363":"380747","364":"384941","365":"389181","366":"393466","367":"397798","368":"402178","369":"406605","370":"411080","371":"415603","372":"420176","373":"424799","374":"429472","375":"434196","376":"438972","377":"443799","378":"448679","379":"453613","380":"458600","381":"463641","382":"468737","383":"473889","384":"479097","385":"484362","386":"489684","387":"495064","388":"500502","389":"506000","390":"511558","391":"517177","392":"522857","393":"528599","394":"534403","395":"540271","396":"546203","397":"552199","398":"558261","399":"564389","400":"570584","401":"576847","402":"583178","403":"589578","404":"596049","405":"602589","406":"609202","407":"615886","408":"622644","409":"629475","410":"636381","411":"643362","412":"650420","413":"657555","414":"664768","415":"672059","416":"679431","417":"686883","418":"694416","419":"702032","420":"709731","421":"717515","422":"725383","423":"733338","424":"741379","425":"749509","426":"757727","427":"766036","428":"774435","429":"782926","430":"791510","431":"800189","432":"808962","433":"817831","434":"826797","435":"835862","436":"845026","437":"854290","438":"863655","439":"873124","440":"882696","441":"892372","442":"902155","443":"912045","444":"922043","445":"932151","446":"942370","447":"952700","448":"963144","449":"973702","450":"984376","451":"995167","452":"1006076","453":"1017105","454":"1028255","455":"1039527","456":"1050923","457":"1062444","458":"1074091","459":"1085865","460":"1097769","461":"1109804","462":"1121970","463":"1134270","464":"1146705","465":"1159277","466":"1171986","467":"1184835","468":"1197825","469":"1210957","470":"1224234","471":"1237656","472":"1251225","473":"1264944","474":"1278813","475":"1292835","476":"1307010","477":"1321341","478":"1335829","479":"1350477","480":"1365285","481":"1380256","482":"1395391","483":"1410693","484":"1426163","485":"1441803","486":"1457614","487":"1473599","488":"1489760","489":"1506098","490":"1522616","491":"1539315","492":"1556198","493":"1573267","494":"1590523","495":"1607968","496":"1625606","497":"1643437","498":"1661464","499":"1679690","500":"1698116"},
  itemLevel: {"1":"101","2":"204","3":"308","4":"414","5":"521","6":"629","7":"740","8":"851","9":"965","10":"1079","11":"1196","12":"1314","13":"1433","14":"1554","15":"1677","16":"1801","17":"1927","18":"2055","19":"2184","20":"2315","21":"2448","22":"2583","23":"2719","24":"2857","25":"2997","26":"3138","27":"3282","28":"3427","29":"3574","30":"3723","31":"3874","32":"4026","33":"4181","34":"4337","35":"4496","36":"4656","37":"4818","38":"4983","39":"5149","40":"5317","41":"5488","42":"5660","43":"5835","44":"6012","45":"6191","46":"6372","47":"6555","48":"6740","49":"6928","50":"7117","51":"7309","52":"7504","53":"7700","54":"7899","55":"8101","56":"8304","57":"8510","58":"8719","59":"8929","60":"9143","61":"9358","62":"9577","63":"9797","64":"10021","65":"10247","66":"10475","67":"10706","68":"10940","69":"11176","70":"11415","71":"11657","72":"11901","73":"12149","74":"12399","75":"12652","76":"12907","77":"13166","78":"13428","79":"13692","80":"13960","81":"14230","82":"14504","83":"14780","84":"15060","85":"15343","86":"15629","87":"15918","88":"16210","89":"16506","90":"16804","91":"17106","92":"17412","93":"17721","94":"18033","95":"18349","96":"18668","97":"18990","98":"19317","99":"19646","100":"19980","101":"20317","102":"20657","103":"21002","104":"21350","105":"21702","106":"22058","107":"22418","108":"22781","109":"23149","110":"23521","111":"23896","112":"24276","113":"24660","114":"25048","115":"25440","116":"25837","117":"26237","118":"26642","119":"27052","120":"27466","121":"27884","122":"28307","123":"28735","124":"29167","125":"29603","126":"30045","127":"30491","128":"30942","129":"31398","130":"31859","131":"32324","132":"32795","133":"33271","134":"33752","135":"34238","136":"34729","137":"35225","138":"35727","139":"36234","140":"36747","141":"37265","142":"37788","143":"38318","144":"38853","145":"39393","146":"39940","147":"40492","148":"41050","149":"41614","150":"42184","151":"42760","152":"43343","153":"43931","154":"44526","155":"45127","156":"45735","157":"46349","158":"46969","159":"47597","160":"48231","161":"48871","162":"49519","163":"50173","164":"50834","165":"51503","166":"52178","167":"52861","168":"53551","169":"54248","170":"54953","171":"55665","172":"56385","173":"57112","174":"57847","175":"58590","176":"59341","177":"60100","178":"60867","179":"61642","180":"62426","181":"63217","182":"64017","183":"64826","184":"65643","185":"66469","186":"67304","187":"68148","188":"69000","189":"69862","190":"70733","191":"71613","192":"72502","193":"73401","194":"74309","195":"75227","196":"76155","197":"77093","198":"78041","199":"78998","200":"79966","201":"80945","202":"81933","203":"82933","204":"83943","205":"84963","206":"85995","207":"87037","208":"88091","209":"89155","210":"90231","211":"91319","212":"92418","213":"93529","214":"94652","215":"95786","216":"96933","217":"98092","218":"99263","219":"100447","220":"101643","221":"102852","222":"104074","223":"105309","224":"106558","225":"107819","226":"109094","227":"110383","228":"111685","229":"113002","230":"114332","231":"115676","232":"117035","233":"118408","234":"119796","235":"121199","236":"122617","237":"124050","238":"125498","239":"126962","240":"128441","241":"129936","242":"131447","243":"132974","244":"134518","245":"136078","246":"137655","247":"139248","248":"140859","249":"142487","250":"144132","251":"145795","252":"147476","253":"149175","254":"150891","255":"152627","256":"154380","257":"156153","258":"157945","259":"159755","260":"161585","261":"163435","262":"165305","263":"167194","264":"169104","265":"171035","266":"172986","267":"174958","268":"176951","269":"178965","270":"181001","271":"183059","272":"185139","273":"187241","274":"189366","275":"191514","276":"193685","277":"195879","278":"198096","279":"200338","280":"202604","281":"204894","282":"207208","283":"209548","284":"211912","285":"214302","286":"216718","287":"219160","288":"221628","289":"224122","290":"226644","291":"229192","292":"231768","293":"234372","294":"237004","295":"239664","296":"242352","297":"245070","298":"247817","299":"250594","300":"253400","301":"256237","302":"259104","303":"262003","304":"264932","305":"267894","306":"270887","307":"273912","308":"276970","309":"280061","310":"283185","311":"286344","312":"289536","313":"292763","314":"296024","315":"299321","316":"302654","317":"306022","318":"309427","319":"312869","320":"316348","321":"319865","322":"323419","323":"327012","324":"330644","325":"334316","326":"338027","327":"341778","328":"345569","329":"349402","330":"353276","331":"357192","332":"361151","333":"365152","334":"369197","335":"373286","336":"377419","337":"381596","338":"385819","339":"390088","340":"394403","341":"398765","342":"403174","343":"407631","344":"412136","345":"416690","346":"421294","347":"425947","348":"430651","349":"435406","350":"440213","351":"445072","352":"449983","353":"454948","354":"459967","355":"465041","356":"470169","357":"475353","358":"480594","359":"485891","360":"491246","361":"496660","362":"502132","363":"507663","364":"513255","365":"518908","366":"524622","367":"530398","368":"536237","369":"542140","370":"548106","371":"554138","372":"560235","373":"566399","374":"572630","375":"578929","376":"585296","377":"591733","378":"598239","379":"604817","380":"611466","381":"618188","382":"624983","383":"631852","384":"638796","385":"645816","386":"652912","387":"660085","388":"667337","389":"674667","390":"682078","391":"689569","392":"697143","393":"704798","394":"712538","395":"720361","396":"728270","397":"736266","398":"744348","399":"752519","400":"760779","401":"769130","402":"777571","403":"786105","404":"794732","405":"803453","406":"812269","407":"821182","408":"830192","409":"839300","410":"848508","411":"857817","412":"867227","413":"876740","414":"886357","415":"896079","416":"905908","417":"915844","418":"925889","419":"936043","420":"946309","421":"956686","422":"967178","423":"977784","424":"988506","425":"999345","426":"1010303","427":"1021381","428":"1032580","429":"1043902","430":"1055347","431":"1066918","432":"1078616","433":"1090442","434":"1102397","435":"1114483","436":"1126701","437":"1139053","438":"1151541","439":"1164165","440":"1176928","441":"1189830","442":"1202874","443":"1216060","444":"1229391","445":"1242868","446":"1256493","447":"1270267","448":"1284192","449":"1298270","450":"1312502","451":"1326890","452":"1341435","453":"1356141","454":"1371007","455":"1386036","456":"1401231","457":"1416592","458":"1432121","459":"1447821","460":"1463693","461":"1479739","462":"1495961","463":"1512361","464":"1528941","465":"1545703","466":"1562648","467":"1579780","468":"1597100","469":"1614610","470":"1632312","471":"1650208","472":"1668301","473":"1686592","474":"1705084","475":"1723780","476":"1742680","477":"1761788","478":"1781106","479":"1800636","480":"1820380","481":"1840341","482":"1860522","483":"1880924","484":"1901551","485":"1922404","486":"1943486","487":"1964799","488":"1986347","489":"2008131","490":"2030155","491":"2052421","492":"2074931","493":"2097689","494":"2120697","495":"2143958","496":"2167475","497":"2191250","498":"2215286","499":"2239587","500":"2264154"},
  messages: {
    // Some messages contain markdown -> http://markdown.de
    // Not command related messages
    botStarted: "Cryptobreedables bot started and online as",
    adminMode:", developer mode is enabled. Only admins are allowed to send commands.",
    cooldown: ", please wait the cooldown of 10 sec on all commands.",
    DMDisabled: "Direct messages are disabled. Please use the official command channel.",
    notValidCommand: "This is not a valid command. Type **!help** for a list and try again.",
    notAllowedCommand: ", you are not allowed to use this command!",
    wentWrong: ", somethig went wrong with your request. Please try again. \nIf the problem persists after another attempt, please contact the admin.",
    walletFailed: "(It was not possible to connect to the wallet. Please make a screenshot and contact the admin.)",
    currentlyBlocked: ", please wait until current event is done before starting another one.",
    private: "Please use the public chat for this command.",
    startstop: { 
      enabled: "Bot commands enabled.",
      disabled: "Bot commands disabled."
    },
    log: {
      action: "Action:",
      content: "Content:"
    },
    title: {
      warning: "Warning",
      error: "Something went wrong",
      info: "Info",
    },
    help: {
      title: "Cryptobreedables bot commands",
      giftTitle: "!gift <@username> <box|divineshield|lifeincreasepotion|healpotion> <amount>",
      giftValue: "Send a item(s) as gift to another user.",
      versionTitle: "!cversion",
      versionValue: "Display current bot version.",
      rezTitle: "!rez",
      rezValue: "If you are dead you can use this command to revive yourself.\n(Please check the #faq for costs of this command)",
      meTitle: "!me",
      meValue: "Display your game stats and link.",      
      mentionTitle: "!mention <on|off>",
      mentionValue: "Join/leave the mention group for monster fights.", 
      topTitle: "!top",
      topValue: "Show top 10 players.",
      useTitle: "!use <box|lifeincreasepotion|healpotion|egg>",
      useValue: "Use the selected item.",
      claimTitle: "!claim",
      claimValue: "Claim a free box every 24 hours.",
      jackpotTitle: "!jackpot",
      jackpotValue: "Show the current jackpot information.",
      activateTitle: "!activate <item type> <item ID>",
      activateValue: "Activate/Change item by type and id for the battle. Type !me to get your profile link to check your items.",
      admin: {
        title: "Cryptobreedables bot admin commands",
        startStopTitle: "!cstart / !cstop",
        startStopValue: "Enable/Disable cryptobreedables bot commands while the bot is running.",
        battleTitle: "!battle <monster life points>",
        battleValue: "Start a new monster battle.",
        destroyTitle: "!destroy",
        destroyValue: "Destroy current monster battle.",
        killTitle: "!kill",
        killValue: "Kill the current bot process.",
        giftTitle: "!gift <@username> <box|divineshield|lifeincreasepotion|healpotion|egg|life|protection> <amount>",
        giftValue: "Send a item as gift to another user.",
        lockTitle: "!lock <on/off/list/reset> <@username>",
        lockValue: "Lock or unlock a user from blocklist commands. Show or reset blocklist users.",
        summaryTitle: "!summary <days as number>",
        summaryValue: "Show total game payouts and incomes of last requested days.",
        shopTitle: "!shop <normal/special/rare>",
        shopValue: "Open shop for users to buy itemas. (special and rare not active right now)",
      }
    },
    claim: {
      error: "Claim failed",
      notReady: ", you can only claim once a day. Time since last claim:\n",
      lowLevel: ", your level is to low to claim a free box. The mimimum level to claim a box is:"
    },
    version: {
      title: "Cryptobreedables",
      botversion: "Version",
    },
    rez: {
      alive: ", you do not have to revive yourself because you are not dead.",
      success: ", you have revived successfully.",
      payment: "have been removed from your balance.",
      error: {
        title: "Missing coins",
        message: ", it seems like you have no or too few coins to revive you. Please deposit new coins to continue playing."
      },
      health: "Health",
      textEnd: ".",
      log: {
        action: "Rez",
        user: "User:"
      }
    },
    divineShield: {
      protect: ", the monster started an attack and your divine shield",
      protect2: "has protected you.",
      destroyed: "The shield could only block one more attack and was",
      destroyed2: "destroyed.",
      reduced: "Your protection got reduced by",
      reduced2: "points.",
      shields: "Shields",
      protection: "Protection",
      textEnd: ".",
      log: {
        action: "Protection",
        user: "User:"
      }
    },
    shop:{
      title: "Shop",
      closed: "Shop has expired and no further purchases can be made.",
      error: {
        title: "Missing coins",
        message: ", it seems like you have no or too few coins to buy this item."
      },
      disclaimer: "By clicking on an icon under this message you can buy a item. All purchases are final and can not be undone. Please read the FAQ for information and the price of each item.",
      log: {
        action: "Shop",
        user: "User:",
        start: "Shop opened"
      },
      success: "has successfully bought",
      success2: "for",
      end: ".",
      jackpot: {
        success: "Added",
        success1: "to the jackpot.",
        success2: "New value is",
        success3: "."
      },
      normal:{
        shopItems: {
          box: "Box",
          potion_red: "Life increase potion",
          potion_green: "Heal potion",
          divineshield: "Divine shield",
        },
      },
      special:{
        shopItems: {
          reddragon: "Red dragon",
          blackdragon: "Black dragon",
          egg: "Egg",
        }
      },
      rare:{
        // soon
      }
    },
    battle: {
      minLifePoints: ", the monster must have at least",
      minLifePoints2: "life points for the fight.",
      title: "Monster Card",
      lifePoints: "Life points",
      round: "Round",
      description: "The fight begins. Click on the sword emoji icon under the picture to attack.",
      active: ", please wait until the active event has ended before you start a new one.",
      attackHit: ", you attacked the monster and reduced the life points by",
      attackCrit: "(critical ",
      attackCrit2: "x",
      attackCrit3: ")",
      attackMiss: ", you missed the monster",
      attackItemHit: "Your",
      attackItemHit2: "attacked the monster",
      attackItemHit3: "with",
      attackItemHit4: "and reduced the life points by",
      attackItemCrit: "(critical ",
      attackItemCrit2: "x",
      attackItemCrit3: ")",
      attackItemMiss: "missed the monster",
      exp: "EXP",
      textEnd: ".",
      dead: ", you are dead and can not attack. Use !rez to",
      dead2: "revive yourself.",
      log: {
        action: "Battle",
        user: "User:",
        win: "Game win",
        loss: "Game loss",
        start: "Game start",
        rain: "Rain",
        rainjackpot: "Rain Jackpot",
        drop: "Drop",
      },
      rain: {
        success: "Raining",
        success1: "on",
        success2: "participating users of the previous round,",
        success3: "each."
      },
      drop: {
        success: ", the bot droped a free item for you.",
        success1: "got credited.",
        box: "Box",
        divineShield: "Divine shield",
        lifeIncreasePotion: "Life increase potion",
        healPotion: "Heal potion",
        egg: "Egg",
      },
      jackpot: {
        success: "Added",
        success1: "to the jackpot.",
        success2: "New value is",
        success3: "."
      }
    },
    level: {
      levelUp: ", congratulations! You have reached level",
      itemLevelUp: ", congratulations! Your",
      itemLevelUp2: "reached level",
      textEnd: ".",
      log: {
        action: "Level up",
        user: "User:"
      }
    },
    lock: {
      notvalid: ", the username is not valid. Please use @username from Discord as name.",
      on: ", the following user has been added to the list:",
      off: ", the following user has been removed from the list:",
      list: ", current blocked users:",
      reset: ", all entries have been removed from the list.",
      none: " none"
    },
    monster: {
      attackHit: ", the monster attacked you and reduced your life by",
      attackHit2: "points.",
      health: "Health",
      textEnd: ".",
      kill: ", the monster",
      kill2: "killed you! Use !rez to",
      kill3: "revive yourself.",
      killMonster: ", you killed",
      killMonster2: "the monster",
      log: {
        action: "Kill",
        user: "User:",
        dead: "Death"
      }
    },
    me: {
      title: "User card",
      content: ', this are your stats.',
      level: "Level",
      exp: "EXP",
      health: "Health",
      boxes: "Boxes",
      divineShield: "Divine shields",
      eggs: "Eggs",
      lifeIncreasePotions: "Life increase potions",
      healPotions: "Heal potions",
      death: "Death",
      kills: "Kills"
    },
    mention:{
      title: "Mention",
      join: ", you have successfully joined the group for mentions.",
      leave: ", you have successfully left the group for mentions."
    },
    top: {
      title: "Leaderboard",
      top: "(TOP",
      top2: ")",
      seperator: " | ",
      seperator2: " - ",
      seperator3: "/",
      level: "Level",
      exp: "EXP",
      health: "Health",
      boxes: "Boxes",
      divineShield: "Divine shields",
      eggs: "Eggs",
      lifeIncreasePotions: "Life increase potions",
      healPotions: "Heal potions"
    },
    gift: {
      notvalid: ", the username is not valid. Please use @username from Discord as name.",
      self: ", you can't gift yourself :)",
      big: ", the item amount",
      big1: "you try to gift is bigger as the value you hold",
      big2: ".",
      empty: ", you have none of the items you try to gift.",
      success: "gifted",
      items:{
        boxes: "box(es)",
        divineShield: "divine shield(s)",
        lifeIncreasePotions: "life increase potion(s)",
        healPotions: "heal potion(s)",
        eggs: "egg(s)",
        life: "health",
        protection: "protection"
      },
      log: {
        action: "Gift",
        user: "User:"
      }
    },
    activate: {
      success: ", you have successfully changed the active item of this type.",
      noItem: ", there is no item of this type with the given id.",
      noneOfType: ", you do not own any item of this type.",
      log: {
        action: "Activate",
        user: "User:"
      }
    },
    jackpot: {
      title: "Jackpot Information",
      value : "CURRENT VALUE",
      lastName : "LAST WINNER",
      lastValue: "LAST WON"
    },
    use:{
      empty: ", you have none of the items you try to use.",
      box: ", you have successfully opened the",
      box1: "box:",
      won: "You received",
      exp: "EXP",
      life: "health",
      protection: "protection",
      divineShield: "divine shield",
      maxdivineShields: "(maximum number already reached)",
      maxhealPotions: "(maximum number already reached)",
      lifeIncreasePotion: "life increase potion",
      healPotion: "Heal potion",
      box3: "extra box",
      eggstitle: "BREEDING PET",
      eggs: ", your new pet was born.",
      lifeIncreasePotions: ", you have successfully used the",
      lifeIncreasePotions1: "life increase potion.",
      lifeIncreasePotions2: "Your",
      lifeIncreasePotions3: "life has been permanently increased by",
      lifeIncreasePotions4: "points.",
      healPotions: ", you have successfully used the",
      healPotions1: "heal potion.",
      healPotions2: "Your",
      healPotions3: "life points have been increased by",
      healPotions4: "points.",
      end: ".",
      jackpot: "JACKPOT!",
      jackpot1: "% of the Jackpot,",
      eventActive: ", please wait until the active event has ended.",
      log: {
        action: "Use",
        user: "User:"
      }
    },
    destroy:{
      title: "Event terminated",
      description: ", the event was stopped successfully.",
      error: ", there is no active event that can be stopped.",
      log: {
        action: "Event",
        content: "manually terminated"
      }
    },
    payment: {
      game: {
        received: "game tip (received)",
        paid: "game payment (sent)"
      }
    },
    summary:{
      title: "Game Payment Summary",
      in: "IN",
      out: "OUT",
      days: "Days"
    }
  }  
};
