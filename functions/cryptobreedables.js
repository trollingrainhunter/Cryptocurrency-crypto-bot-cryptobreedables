try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

var check = require("./check.js");
var getJSON = require('get-json')

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Function to create random pet
    /* ------------------------------------------------------------------------------ */

    pet_create_item_random_characteristics: async function(petType){
        var pet = {};
        if(petType == 'dragon'){
            /* Level */
            pet.level = config.items.dragon.level;
            /* EXP */
            pet.exp = config.items.dragon.exp;
            /* Color */
            pet.color = check.check_random_from_to_floating(0,1,2)+','+check.check_random_from_to_floating(0,1,2)+','+check.check_random_from_to_floating(0,1,2);
            /* Glow */
            var checkPetGlow = check.check_chance_bool(config.items.dragon.glow.chance);
            if(checkPetGlow){
                pet.glow = check.check_random_from_to_floating(config.items.dragon.glow.from,config.items.dragon.glow.to,2);
            }else{
                pet.glow = config.items.dragon.glow.standard;
            }
            /* Shine */
            var checkPetShine = check.check_chance_bool(config.items.dragon.shine.chance);
            if(checkPetShine){
                pet.shine = check.check_random_from_to_floating(config.items.dragon.shine.from,config.items.dragon.shine.to,2);
            }else{
                pet.shine = config.items.dragon.shine.standard;
            }
            /* GEN */
            pet.gen = config.items.dragon.gen;
        }
        if(petType == 'reddragon'){
            pet.level = config.items.reddragon.level;
            pet.exp = config.items.reddragon.exp;
        }
        if(petType == 'blackdragon'){
            pet.level = config.items.reddragon.level;
            pet.exp = config.items.reddragon.exp;
        }
        return pet;
    },

    /* ------------------------------------------------------------------------------ */
    // Function to create a new pet colour on breed
    /* ------------------------------------------------------------------------------ */

    pet_create_new_colour: function(colourOne,colourTwo){
        var newcolour = [0,0,0]; // empty colour (black)
        var colourDeviation = Math.floor((Math.random()*11)-5)/100; // deviation -0.05 || -0.04 || -0.03 || -0.02 || -0.01 || 0 || 0.01 || 0.02 || 0.03 || 0.04 || 0.05

        if(colourOne[0] != 0 || colourTwo[0] != 0)
            newcolour[0] = ((colourOne[0] / 2 + colourTwo[0] / 2) + colourDeviation).toFixed(2);
        if(colourOne[1] != 0 || colourTwo[1] != 0)
            newcolour[1] = ((colourOne[1] / 2 + colourTwo[1] / 2) + colourDeviation).toFixed(2);
        if(colourOne[2] != 0 || colourTwo[2] != 0)
            newcolour[2] = ((colourOne[2] / 2 + colourTwo[2] / 2) + colourDeviation).toFixed(2);

        if (newcolour[0] < 0)
            newcolour[0] = 0;

        if (newcolour[0] > 1)
            newcolour[0] = 1;

        if (newcolour[1] < 0)
            newcolour[1] = 0;

        if (newcolour[1] > 1)
            newcolour[1] = 1;

        if (newcolour[2] < 0)
            newcolour[2] = 0;

        if (newcolour[2] > 1)
            newcolour[2] = 1;

        return newcolour;
    },

    /* ------------------------------------------------------------------------------ */
    // Function to create rgba colour in % out of vector colour
    /* ------------------------------------------------------------------------------ */

    pet_create_rgb_percent_colour: function(colour,returnType){
        if(returnType == 'array'){
            var rgbColourInPercent = [(colour[0]*100).toFixed(0),(colour[1]*100).toFixed(0),(colour[2]*100).toFixed(0)];
        }
        if(returnType == 'string'){
            var rgbColourInPercent = 'R: '+(colour[0]*100).toFixed(0)+'% G: '+(colour[1]*100).toFixed(0)+'%  B: '+(colour[2]*100).toFixed(0)+'%';
        }
        return rgbColourInPercent;
    },

    /* ------------------------------------------------------------------------------ */
    // Create link and get image hash
    /* ------------------------------------------------------------------------------ */

    pet_get_image_hash: function(petType,petInfo){
        return new Promise((resolve, reject)=>{
            var imageLink = config.bot.websiteCreateImgLink;
            if(petType == 'dragon'){
                //?type=replace_type&gen=replace_gen&glow=replace_glow&shine=replace_shine&r=replace_r&g=replace_g&b=replace_b&apikey=replace_apikey
                var petColors = petInfo.color.split(',');
                imageLink = imageLink + '?type='+petType+'&gen='+petInfo.gen+'&glow='+petInfo.glow+'&shine='+petInfo.shine+'&r='+petColors[0]+'&g='+petColors[1]+'&b='+petColors[2]+'&apikey='+config.bot.websiteApiKey;
            }
            getJSON(imageLink, function(error, response){
                if(error){
                    resolve(false);
                }
                resolve(response);
            });
        });
    }
    
};