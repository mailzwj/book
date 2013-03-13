/*
 * 获取当前服务器根路径
 */


var rootDir = getRootDir();

function getRootDir () {
	var rootDir = __dirname,
		dirArr = rootDir.split(/\\|\//gi);
	if (dirArr.length > 1) {
		return dirArr[dirArr.length - 2];
	} else {
		return '';
	}
}

exports.rootDir = rootDir;