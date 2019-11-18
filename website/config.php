<?php
    return array(
        'debug' => false, // Debug modus for all files
        'apikey' => '12Cryptobreedables34', // Is used + time() as md5 hash for image names
        'tmppath' => '/tmp/', // Images get saved to the temp folder
        'deletetime' => 300, // Time in seconds how long image files will last in tmp folder before they get deleted
        'colorchange' => 25, // Change in RGB points for darker/lighter parts of pet
        'createimagelink' => 'https://domain.link/api/create_pet_image.php',
        // Dragon api
        'dragonfilepath' => '/pets/dragons/',
        // Red dragon api
        'reddragonfilepath' => '/pets/reddragon/',
        // Red dragon api
        'blackdragonfilepath' => '/pets/blackdragon/',
        // Possible coins
        "gamePath" => ['cryptobreedables'],
        // Lowdb path
        'lowdbpath' => '/data/'
    );
?>