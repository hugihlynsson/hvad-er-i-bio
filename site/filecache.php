<?php
		
	// Number of seconds a file should be cached:
	$cacheTime = 600;
	$cacheFolder = 'cache/';

	function isCached ($file) {
		global $cacheTime, $cacheFolder;
		$cachefile = $cacheFolder . $file;
		$cachefileCreated = (file_exists($cachefile)) ? @filemtime($cachefile) : 0;
		return ((time() - $cacheTime) < $cachefileCreated);
	}

	function readCache ($file) {
		global $cacheFolder;
		$cachefile = $cacheFolder . $file;
		return file_get_contents($cachefile);
	}

	function writeCache ($file, $out) {
		echo 'Debug: notCached';
		global $cacheFolder;
		$cachefile = $cacheFolder . $file;
		$fp = fopen($cachefile, 'w');
		fwrite($fp, $out);
		fclose($fp);
	}

	$cacheFile = md5($_SERVER['REQUEST_URI']) . '.html';

	if (isCached($cacheFile)) {
		echo readCache($cacheFile);
		exit();
	}

	ob_start();
?>