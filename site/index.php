<?php
	header('Content-Type: text/html; charset=utf-8');
	// error_reporting(E_ALL);
	// ini_set('display_errors', 'ON');

	// include 'filecache.php';
?>
<!DOCTYPE html>
<html lang="is">
	<head>
		<meta charset="UTF-8">
		<title>Hvað er í bíó</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<meta name="apple-mobile-web-app-capable" content="yes">
		<link rel="apple-touch-icon" sizes="60x60"  href="images/apple-touch-icon-60x60.png">
		<link rel="apple-touch-icon" sizes="76x76" href="images/apple-touch-icon-76x76.png">
		<link rel="apple-touch-icon" sizes="120x120" href="images/apple-touch-icon-120x120.png">
		<link rel="apple-touch-icon" sizes="152x152" href="images/apple-touch-icon-156x156.png">
		<link rel="shortcut icon" sizes="16x16" href="images/icon-16x16.png">
		<link rel="shortcut icon" sizes="32x32" href="images/icon-32x32.png">
		<link rel="shortcut icon" sizes="128x128" href="images/icon-128x128.png">
		<link rel="shortcut icon" sizes="196x196" href="images/icon-196x196.png">

		<link rel="stylesheet" href="style.css">

		<script type="text/javascript">
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-20956924-1']);
			_gaq.push(['_trackPageview']);
			(function() {
				var ga = document.createElement('script');
				ga.type = 'text/javascript';
				ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		</script>

		<script type="text/javascript" src="//use.typekit.net/kyo1clm.js"></script>
		<script type="text/javascript">try{Typekit.load();}catch(e){}</script>
	</head>

	<body>
		<h1>Hvað er í bíó?</h1>

		<div class="filters">
			<div class="filters-wrap">
				<div class="two-col">
					<div class="input-box time-range">
						<label for="from-time">Frá</label>
						<div class="range-wrap">
							<span class="range-mark from">00:00</span>
							<div class="range">
								<input id="from-time" type="range" min="0" max="24" step="0.25" name="from-time" value="0">
								<output for="from-time">0</output>
							</div>
							<span class="range-mark to">24:00</span>
						</div>
					</div>
					<div class="input-box time-range">
						<label for="to-time">Til</label>
						<div class="range-wrap">
							<span class="range-mark from">00:00</span>
							<div class="range">
								<input id="to-time" type="range" min="0" max="24" step="0.25" name="to-time" value="24">
								<output for="to-time">24</output>
							</div>
							<span class="range-mark to">24:00</span>
						</div>
					</div>
				</div>
				<div class="input-box text-filter">
					<label for="text-filter">Heiti</label>
					<input id="text-filter" type="text" placeholder="Pulp Fiction">
				</div>
			</div>
			<div class="filters-wrap place-filter">
				<ul></ul>
			</div>
		</div>

		<div class="movies-wrap">
			<?php
				$json = file_get_contents('http://apis.is/cinema');
				$jsonDecoded = json_decode($json);
				
				foreach ($jsonDecoded->results as $movie) {
					$title = $movie->title;
					$restriction = $movie->restricted;
					$imageUrl = $movie->image;
					$imageType = end(explode('.', $imageUrl));
					$imageName = urlencode($title . '.' . $imageType);
			?>
			<article class="movie" data-id="<?=$title?>">
				<header>
					<h2><?=$movie->title?><?php if ($restriction != '') { ?>
						<i<?php 
							if (is_numeric(current(explode(' ', $restriction)))) 
								echo ' class="warning"'; 
						?>><?=$restriction?></i>
					<?php } ?></h2>
					<a class="mark" href="#">Merkja</a>
				</header>
				<a class="more" href="#">Sjá meira</a>
				<aside class="extra">
					<img src="<?=$imageUrl?>" alt="Plakat fyrir <?=$title?>">	
					<div class="padding"></div>
					<div class="content">
						<?php
							foreach ($movie->showtimes as $showtime) {
								$theater = $showtime->theater;
						?>
						<div class="showplace" data-place="<?=$theater?>">
							<h3><?=$theater?>:</h3>
							<ul>
								<?php foreach ($showtime->schedule as $time) { ?>
								<li data-time="<?=current(explode(' ', $time))?>"><?=$time?></li>
								<?php } ?>
							</ul>
						</div>
						<?php } ?>
					</div>
				</aside>
			</article>
			<?php } ?>
		</div>

		<script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
		<script src="main.js"></script>
	</body>
</html>

<?php
	// writeCache($cacheFile, ob_get_contents());
?>
