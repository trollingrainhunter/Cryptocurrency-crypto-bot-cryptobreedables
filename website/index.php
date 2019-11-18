<?php
    error_reporting(E_ERROR | E_PARSE);
    $config = include('config.php'); 
    // If user profile request
    $explode_url_user = false;
    if(strpos($_SERVER['REQUEST_URI'], "/u/") !== false){
        $display_user = true;
        $explode_url = explode("/", $_SERVER['REQUEST_URI']);
        $explode_url_coin = $explode_url[count($explode_url)-2];
        $explode_url_user = $explode_url[count($explode_url)-1];
        if(!ctype_alnum($explode_url_user) || !in_array($explode_url_coin, $config['gamePath'])) {
            $explode_url_user = false; 
        }  
    }
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>Cryptobreedables.com - Breed / Collect / Fight</title>
        <meta name="keywords" content="Cryptobreedables, Cryptocurrency, Cryptocurrency Game, Crypto Game, Discord Game">
        <meta name="description" content="Cryptobreedables is a text and image based driven game. Its as easy as it sounds. All actions can be done by reacting to the bot messages by clicking the emoji icons given on the events. You can fight, level up, collect some nice items and earn free crypto coins.">
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicons/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicons/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicons/favicon-16x16.png">
        <link rel="manifest" href="/images/favicons/site.webmanifest">
        <link rel="mask-icon" href="/images/favicons/safari-pinned-tab.svg" color="#878787">
        <link rel="shortcut icon" href="/images/favicons/favicon.ico">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-config" content="/images/favicons/browserconfig.xml">
        <meta name="theme-color" content="#ffffff">
        <link href="https://fonts.googleapis.com/css?family=Asap:400,500,700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css" integrity="sha256-l85OmPOjvil/SOvVt3HnSSjzF1TUMyT9eV0c2BzEGzU=" crossorigin="anonymous" />
        <link rel="stylesheet" href="/css/cb.css">
    </head>
    <body>
        <center>
            <img id="logo" src="/images/cryptobreedables_logo.svg" alt="Cryptobreedables Logo" />
        </center>
        <div id="wrapper">
            <div class="container">
                <?php
                    if($explode_url_user){
                ?>
                    <p class="center">
                        <?php 
                            $strJsonFileContents = file_get_contents('.'.$config['lowdbpath'].$explode_url_coin.'/lowdb.json');
                            $array = json_decode($strJsonFileContents, true);
                            $user_data = $array[$explode_url_user]['games']['cryptobreedables'];
                            if(!$user_data){
                                echo "<div class='message background_error'>There is no user profile with the given ID.</div>";
                            }else{
                                // Normal data
                                echo "<div class='flex_container center'>";
                                    $user_level = $user_data['level'];
                                    echo "<div class='flex_item'>";
                                        echo "<img class='mini_icon' src='/images/profile.png' />"."<span>Level: ".$user_level."</span>";
                                    echo "</div>";
                                    $user_exp = $user_data['exp'];
                                    echo "<div class='flex_item'>";
                                        echo "<img class='mini_icon' src='/images/levelup.png' />"."<span>Exp: ".$user_exp."</span>";
                                    echo "</div>";
                                    $user_health = $user_data['health'];
                                    $user_rezHealth = $user_data['rezHealth'];
                                    echo "<div class='flex_item'>";
                                        echo "<img class='mini_icon' src='/images/heart_full.png' />"."<span>Health: ".$user_health."<br>Rez health: ".$user_rezHealth."</span>";
                                    echo "</div>";
                                    $user_death = $user_data['death'];
                                    echo "<div class='flex_item'>";
                                        echo "<img class='mini_icon' src='/images/dead.png' />"."<span>Deaths: ".$user_death."</span>";
                                    echo "</div>";
                                    $user_kills = $user_data['kills'];
                                    echo "<div class='flex_item'>";
                                        echo "<img class='mini_icon' src='/images/sword.png' />"."<span>Kills: ".$user_kills."</span>";
                                    echo "</div>";
                                    //echo "Level: ".$user_level."<br>"."Exp: ".$user_exp."<br>"."Health: ".$user_health."<br>"."RezHealth: ".$user_rezHealz."<br>"."Death: ".$user_death."<br>"."Kills: ".$user_kills."<br><br>";
                                    // Items
                                    $user_items = $user_data['items'];
                                    $user_item_lifeIncreasePotions = $user_items['lifeIncreasePotions'];
                                    echo "<div class='flex_item'>";
                                        echo "<img class='mini_icon' src='/images/potion_red.png' />"."<span>Life increase potions: ".$user_item_lifeIncreasePotions."</span>";
                                    echo "</div>";
                                    $user_item_healPotions = $user_items['healPotions'];
                                    echo "<div class='flex_item'>";
                                        echo "<img class='mini_icon' src='/images/potion_green.png' />"."<span>Heal potions: ".$user_item_healPotions."</span>";
                                    echo "</div>";
                                    $user_item_eggs = $user_items['eggs'];
                                    echo "<div class='flex_item'>";
                                        echo "<img class='mini_icon' src='/images/eggs.png' />"."<span>Eggs: ".$user_item_eggs."</span>";
                                    echo "</div>";
                                    $user_item_boxes = $user_items['boxes'];
                                    echo "<div class='flex_item'>";
                                        echo "<img class='mini_icon' src='/images/box.png' />"."<span>Boxes: ".$user_item_boxes."</span>";
                                    echo "</div>";
                                    $user_item_divineShieldCount = $user_items['divineShield']['count'];
                                    $user_item_divineShieldHealth = $user_items['divineShield']['health'];
                                    echo "<div class='flex_item'>";
                                        echo "<img class='mini_icon' src='/images/divineshield.png' />"."<span class='padding_left'>Divineshields: ".$user_item_divineShieldCount."<br>Health: ".$user_item_divineShieldHealth."</span>";
                                    echo "</div>";
                                    //echo "LifeIncreasePotions: ".$user_item_lifeIncreasePotions."<br>"."Eggs: ".$user_item_eggs."<br>"."Boxes: ".$user_item_boxes."<br>"."DivineShileCount: ".$user_item_divineShieldCount."<br>"."DivineShileHealth: ".$user_item_divineShieldHealth."<br><br>";
                                echo "</div>";
                                // Attack items
                                $user_attackItems = $user_data['attackItems'];
                                if($user_attackItems)
                                    echo "<div class='message background_dark'>Attack Items</div>";
                                foreach ($user_attackItems as $key => $value){
                                    // Type
                                    $itemType = $key;
                                    echo "<div class='message background_orange'>Type: <span class='badge'>".$itemType."</span> - Active ID: <span class='badge'>".$value['activeID']."</span></div>";
                                    // Items
                                    echo "<div class='flex_container'>";
                                        foreach ($value as $key => $value){
                                            // Item
                                            if($key != 'activeID'){
                                                echo "<div class='flex_item'>";
                                                    if($itemType == 'dragon'){
                                                        //echo $config['createimagelink']."?type=dragon&gen=".$value['gen']."&glow=".$value['glow']."&shine=".$value['shine']."&r=".explode(',',$value['color'])[0]."&g=".explode(',',$value['color'])[1]."&b=".explode(',',$value['color'])[2]."&apikey=<br>";
                                                        $strJsonFileContents = file_get_contents($config['createimagelink']."?type=dragon&gen=".$value['gen']."&glow=".$value['glow']."&shine=".$value['shine']."&r=".explode(',',$value['color'])[0]."&g=".explode(',',$value['color'])[1]."&b=".explode(',',$value['color'])[2]."&apikey=".$config['apikey'],true);
                                                        $array = json_decode($strJsonFileContents,true);
                                                        //print_r($array);
                                                        echo "<div class='badge'><img src='".$config['tmppath'].$array['hash']."' /></div>";
                                                    }
                                                    if($itemType == 'reddragon'){
                                                        //echo $config['createimagelink']."?type=dragon&gen=".$value['gen']."&glow=".$value['glow']."&shine=".$value['shine']."&r=".explode(',',$value['color'])[0]."&g=".explode(',',$value['color'])[1]."&b=".explode(',',$value['color'])[2]."&apikey=<br>";
                                                        $strJsonFileContents = file_get_contents($config['createimagelink']."?type=reddragon&apikey=".$config['apikey'],true);
                                                        $array = json_decode($strJsonFileContents,true);
                                                        //print_r($array);
                                                        echo "<div class='badge'><img src='".$config['tmppath'].$array['hash']."' /></div>";
                                                    }
                                                    if($itemType == 'blackdragon'){
                                                        //echo $config['createimagelink']."?type=dragon&gen=".$value['gen']."&glow=".$value['glow']."&shine=".$value['shine']."&r=".explode(',',$value['color'])[0]."&g=".explode(',',$value['color'])[1]."&b=".explode(',',$value['color'])[2]."&apikey=<br>";
                                                        $strJsonFileContents = file_get_contents($config['createimagelink']."?type=blackdragon&apikey=".$config['apikey'],true);
                                                        $array = json_decode($strJsonFileContents,true);
                                                        //print_r($array);
                                                        echo "<div class='badge'><img src='".$config['tmppath'].$array['hash']."' /></div>";
                                                    }
                                                    $petID = $key;
                                                    echo "<div class='badge'><span class='bold'>ID:</span> ".$petID."</div>";;
                                                    // Item stats
                                                    foreach ($value as $key => $value){
                                                        if($key == 'color'){
                                                            $value = explode(',',$value);
                                                            $value = 'R '.($value[0]*100).'% G '.($value[1]*100).'% B '.($value[2]*100).'%';

                                                        }
                                                        echo "<div class='badge'><span class='bold'>".ucfirst($key).":</span> ".$value."</div>";;
                                                    }
                                                echo "</div>";
                                            }
                                        }
                                    echo "</div>";
                                }
                            }
                        ?>
                    </p>
                <?php
                    }else{
                ?>
                    <p class="center"><span class="bold">Cryptobreedables</span> is a text and image based driven <span class="bold">Discord game</span>. Its as easy as it sounds. All actions can be done by reacting to the bot messages by clicking the emoji icons given on the events. You can fight, level up, collect nice items and <span class="bold">earn free crypto coins</span>.</p>
                <?php
                    }
                ?>
            </div>
            <p class="center copyright">Copyright © <?php echo date('Y'); ?> Cryptobreedables. All rights reserved.</p>
        </div>
    <script src="/js/cb.js"></script>
    </body>
</html>