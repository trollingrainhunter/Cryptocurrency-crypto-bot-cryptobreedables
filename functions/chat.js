try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

const { RichEmbed } = require('discord.js');

var check = require("./check.js");

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Create reply message
    /* ------------------------------------------------------------------------------ */
    //   msg.channel.send(chat.chat_build_reply('embed',userName,messageType,config.colors.special,['Test Author Name',config.wallet.thumbnailIcon,'https://google.de'],'Title',[['Testfield1','Testfield1 Value',true],['Testfield2','Testfield2 Value',true]],'This is a test description.',['Test Footer',config.wallet.thumbnailIcon],config.wallet.thumbnailIcon,'https://media.wired.com/photos/5ada3a2c1e66870735eada27/master/pass/DragonPasswordFINAL.jpg',1));
    chat_build_reply: function(replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp){
        if(replyType == 'normal'){
            if(senderMessageType == 'dm' || !replyUsername){
                return replyDescription;
            }else{
                return  replyUsername + replyDescription; 
            }
        }
        if(replyType == 'embed' || 'private'){
            var embed = new RichEmbed();
            // Set embed color
            if(replyEmbedColor){
                embed.setColor(replyEmbedColor);
            }else{
                embed.setColor(config.colors.normal);
            }
            // Set reply autor
            if(replyAuthor){
                var replyAuthorName = '';
                var replyAuthorIcon = '';
                var replyAuthorLink = '';
                if(replyAuthor[0])
                    replyAuthorName = replyAuthor[0];
                if(replyAuthor[1])
                replyAuthorIcon = replyAuthor[1];
                if(replyAuthor[2])
                    replyAuthorLink = replyAuthor[2];
                embed.setAuthor(replyAuthorName,replyAuthorIcon,replyAuthorLink);
            }
            // Set Title
            if(replyTitle){
                embed.setTitle(replyTitle.toUpperCase());
            }
            // This could be added to be able to set a link for the title
            // embed.setURL('http://google.de');
             // Set description
            if(replyDescription){
                //console.log(senderMessageType+' '+replyUsername+' '+typeof(replyUsername));
                // Check if request was not private or add username disabled
                if(senderMessageType === 'dm' || !replyUsername){
                    embed.setDescription(replyDescription);
                }else{
                    embed.setDescription(replyUsername + replyDescription);
                }
            }
            // Set reply fields
            for (var i = 0 ; i < replyFields.length ; ++i){
                if(replyFields[i][0] === 0 && replyFields[i][1] === 0){
                    embed.addBlankField(replyFields[i][2]);
                }else{
                    embed.addField(replyFields[i][0],replyFields[i][1],replyFields[i][2]);
                }
                
            }
            // Set reply footer
            if(replyFooter){
                var replyFooterText = '';
                var replyFooterIcon = '';
                if(replyFooter[0])
                    replyFooterText = replyFooter[0];
                if(replyFooter[1])
                    replyFooterIcon = replyFooter[1];
                embed.setFooter(replyFooterText,replyFooterIcon);
            }else{
                embed.setFooter(config.bot.websiteLink,config.bot.websiteIcon);
            }
            
            // Set thumbnail
            if(replyThumbnail){
                embed.setThumbnail(replyThumbnail);
            }   
            // Set image
            if(replyImage){
                if(!replyImage.includes("http")){
                    embed.attachFiles([process.cwd()+'/images/'+replyImage])
                    embed.setImage('attachment://'+replyImage);
                }else{
                    embed.setImage(replyImage);
                }
            }
            // Set timestamp
            if(replyTimestamp){
                embed.setTimestamp();
            }
            // all done and return embed
            return embed;
        }
        if(replyType == 'image'){
            return '{files: ["'+process.cwd()+'/images/'+replyImage+'"]}';
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Build chat reply
    /* ------------------------------------------------------------------------------ */

    chat_reply: function(msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp){
        // Check if msg empty and use main chat id for reply
        if(msg == 'battlecron'){
            return globalClient.channels.get(check.check_getRandomFromArray(config.bot.respondChannelIDs,1)[0]).send(this.chat_build_reply(replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp));
        }
        // Check if msg empty and use main chat id for reply
        if(msg == 'shopcron'){
            return globalClient.channels.get(check.check_getRandomFromArray(config.bot.respondChannelIDs,1)[0]).send(this.chat_build_reply(replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp));
        }
        if(replyType == 'private'){
            return msg.author.send(this.chat_build_reply(replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp));
        }else{
            return msg.channel.send(this.chat_build_reply(replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp));
        }
    },

    chat_delete_message: function(message){
        try{
            message.delete();
        }catch (error){
        }
    },

    chat_edit_message: function(messageID,message){ 
        try{
            messageID.edit(message);
        }catch (error){
        }
    }
    
};