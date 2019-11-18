<?php
    error_reporting(E_ERROR | E_PARSE);
    $config = include('../config.php'); 
    $time = microtime();
    $hash = md5($time.$config['apikey']);
    $returnData = [];
    $returnData['error'] = false;
    
    function fromRGB($R, $G, $B)
    {
        $R = dechex($R);
        if (strlen($R)<2)
        $R = '0'.$R;

        $G = dechex($G);
        if (strlen($G)<2)
        $G = '0'.$G;

        $B = dechex($B);
        if (strlen($B)<2)
        $B = '0'.$B;

        return '#' . $R . $G . $B;
    }

    function darkerCheck($c){
        if($c < 0)
           return 0+$config['colorchange'];
        else{
            return $c;
        }
        if($c > 255)
           return 255-$config['colorchange'];
        else{
            return $c;
        }
    }

    function calcColor($c){
        return 255*$c;
    }

    $apikey = $_GET['apikey'];
    if($apikey === $config['apikey']){
        if(isset($_GET['type'])){
            $pettype = $_GET['type'];
            if($pettype == 'dragon'){
                // https://cryptobreedables.com/api/create_pet_image.php?type=dragon&gen=1&glow=0.05&shine=0&r=0.25&g=0.25&b=0.25&apikey=key
                if(isset($_GET['gen']) && is_numeric($_GET['gen']) && isset($_GET['glow']) && is_numeric($_GET['glow']) && isset($_GET['shine']) && is_numeric($_GET['shine']) && isset($_GET['r']) && is_numeric($_GET['r']) && isset($_GET['g']) && is_numeric($_GET['g']) && isset($_GET['b']) && is_numeric($_GET['b'])) {
                    $gen = $_GET['gen'];
                    $glow = $_GET['glow'];
                    $shine = $_GET['shine'];
                    $r = calcColor($_GET['r']);
                    $r_dark = $r-$color_dark;
                    $r_dark = darkerCheck($r_dark);
                    $g = calcColor($_GET['g']);
                    $g_dark = $g-$color_dark;
                    $g_dark = darkerCheck($g_dark);
                    $b = calcColor($_GET['b']);
                    $b_dark = $b-$color_dark;
                    $b_dark = darkerCheck($b_dark);
                    if ($gen >= 0 && $gen <= 10 && $glow >= 0 && $glow <= 10 && $shine >= 0 && $shine <= 1 && $r >= 0 && $r <= 255 && $g >= 0 && $g <= 255 && $b >= 0 && $b <= 255){
                        $im = new Imagick(250,292,'none');
                        $im->setBackgroundColor(new ImagickPixel("rgba(250,15,150,0)"));
                        $filename = '..'.$config['dragonfilepath'].$gen.'.svg';
                        $svg = file_get_contents($filename);
                        $svg = str_replace(".st0{opacity:0.5;fill:#FFFFFF;stroke:#FFE006;stroke-width:10;enable-background:new    ;}", ".st0{opacity:".$glow.";fill:#FFFFFF;stroke:#FFE006;stroke-width:10;enable-background:new    ;}", $svg);
                        $svg = str_replace(".st20{fill:#ECC962;stroke:#4A4A49;stroke-width:0.2;stroke-miterlimit:10;}", ".st20{opacity:".$shine.";fill:#ECC962;stroke:#4A4A49;stroke-width:0.2;stroke-miterlimit:10;}", $svg);
                        $svg = str_replace(".st21{fill:#FFF8CE;stroke:#4A4A49;stroke-width:0.2;stroke-miterlimit:10;}", ".st21{opacity:".$shine.";fill:#FFF8CE;stroke:#4A4A49;stroke-width:0.2;stroke-miterlimit:10;}", $svg);
                        $svg = str_replace(".st3{fill:#086FB7;}", ".st3{fill:".fromRGB($r,$g,$b).";}", $svg);
                        $svg = str_replace(".st13{fill:#0E609D;}", ".st13{fill:".fromRGB($r_dark,$g_dark,$b_dark).";}", $svg);
                        $im->readImageBlob($svg);
                        $im->setImageFormat("png32");   
                        $im->resizeImage(250, 292, imagick::FILTER_HAMMING, 1);
                        $im->writeImage('..'.$config['tmppath'].$hash.".png");
                        $im->clear();
                        $im->destroy();
                        $returnData['hash'] = $hash;
                    }else{
                        $returnData['error'] = true;
                    }
                    if($config['debug']){
                        echo "<img src='..".$config['tmppath']."".$hash.".png' /><br>";
                        echo "R: ".$r." G: ".$g." B: ".$b."<br>";
                        echo "R: ".$r_dark." G: ".$g_dark." B: ".$b_dark;
                    }
                }
            }

            if($pettype == 'reddragon'){
                $im = new Imagick(250,292,'none');
                $im->setBackgroundColor(new ImagickPixel("rgba(250,15,150,0)"));
                $filename = '..'.$config['reddragonfilepath'].$pettype.'.svg';
                $svg = file_get_contents($filename);
                $im->readImageBlob($svg);
                $im->setImageFormat("png32");   
                $im->resizeImage(250, 292, imagick::FILTER_HAMMING, 1);
                $im->writeImage('..'.$config['tmppath'].$hash.".png");
                $im->clear();
                $im->destroy();
                $returnData['hash'] = $hash;
            }

            if($pettype == 'blackdragon'){
                $im = new Imagick(250,292,'none');
                $im->setBackgroundColor(new ImagickPixel("rgba(250,15,150,0)"));
                $filename = '..'.$config['blackdragonfilepath'].$pettype.'.svg';
                $svg = file_get_contents($filename);
                $im->readImageBlob($svg);
                $im->setImageFormat("png32");   
                $im->resizeImage(250, 292, imagick::FILTER_HAMMING, 1);
                $im->writeImage('..'.$config['tmppath'].$hash.".png");
                $im->clear();
                $im->destroy();
                $returnData['hash'] = $hash;
            }

            // Other pets 
            // ...

            if(!$returnData['hash'])
                $returnData['error'] = true; // if it was not possible to create a hash
        }else{
            $returnData['error'] = true; // No pet type set
        }
    }else{
        $returnData['error'] = true; // Wrong api key
    }

    // Delete files older 5 mins
    foreach (glob('..'.$config['tmppath']."*.png") as $file) {
        if(time() - filemtime($file) > $config['deletetime']){
            unlink($file);
        }
    }

    header('Content-type: application/json');
    echo json_encode($returnData);

?>