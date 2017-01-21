var fortuneCookies = [
	'战胜你的恐惧或征服你。',
	'河流需要泉水。',
	'不要害怕你不知道。',
	'你将会有一个惊喜。',
	'只要有可能,保持简单。',
	'今天不会做的事，明天也不会做'
];

exports.getFortune = function(){
	var idx = Math.floor(Math.random() * fortuneCookies.length);
	return fortuneCookies[idx];
};

