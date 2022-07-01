﻿let modInfo = {
	name: "升级树",
	nameEN: "The Upgrading Tree",
	id: "The_upgrading_tree",
	author: "QwQe308",
	pointsName: "点数",
	pointsNameEN: "points",
	discordName: "",
	discordLink: "",
	initialStartPoints: new ExpantaNum (0.5), // Used for hard resets and new players
	
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.45",
	name: "",
}

let changelog = `<h1>更新日志(Currently not translated):</h1><br>
	<h3>v0.45</h3><br>
		- 增加强制A重置功能.<br>
		- 修复翻译问题.添加部分说明.<br><br>
	<h3>v0.44</h3><br>
		- 增加语言调节(英文).<br>
		- 加强了S节点.<br><br>
	<h3>v0.43</h3><br>
		- 修复t升级11无法移除上限的问题.<br><br>
	<h3>v0.42</h3><br>
		- 微调c1加成.<br>
		- 显示点数获取速率.<br><br>
	<h3>v0.41</h3><br>
		- 修复时间能量上限公式错误的问题.<br>
		- 修复T/S节点可能排序错误的问题.<br>
		- 修复完成挑战还需要完成进入要求的问题.<br>
		- 降低自动化价格.<br><br>
	<h3>v0.4</h3><br>
		- 修复了U节点部分情况下已有附近升级却无法解锁的情况.<br>
		- 添加一排升级,两个节点,一个挑战,两个自动化.<br>
		- 现在U挑战能在未解锁时显示.修改挑战效果.<br>
		- 补全汉化.<br>
		- 当前endgame:128升级点.<br><br>
	<h3>v0.3</h3><br>
		- 添加自动化节点.*重点*<br>
		- 重平衡和修改部分内容.<br>
		- 暂时移除了第四排升级.(其实就移除了一个)<br>
		- v0.22中大于50升级点的存档被强制返回至50升级点.<br>
		- 当前endgame:50升级点.<br><br>
	<h3>v0.22</h3><br>
		- 添加一个升级和一个节点.当前endgame:90升级点.<br><br>
	<h3>v0.21</h3><br>
		- 修正endgame至45.<br><br>
	<h3>v0.2</h3><br>
		- 添加一排升级.(QwQe308:v0.2全程手机码字呜呜呜)<br><br>
	<h3>v0.1</h3><br>
		- 添加前两排升级.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new ExpantaNum(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	let gain = trueGain
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function(){
		var U1Function = (options.ch?`点数`:`Point`)+` = f(t) = ${format(getU1PointMult())} * t<sup>${format(getU1TimeExp())}</sup>`
		return U1Function
	},
	function(){return `t = ${format(player.u1.t)} (+ ${format(getU1TimeSpeed())} /s)`},
	function(){return (options.ch?`当前Endgame:128升级点`:`Current Endgame: 128 Upgrade Points`)},
]

// Determines when the game "ends"
function isEndgame() {
	return player.u1.total.gte(128)
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(1800) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
  if(oldVersion <= 0.22){
    if(player.u1.total.gte(50)){
      player.u1.buyables[11]=n(21)
      player.u1.buyables[12]=n(15)
      player.u1.buyables[13]=n(7)
      player.u1.buyables[14]=n(7)
      player.u1.buyables[21]=n(0)
      player.u1.total = n(50)
	  player.u1.best = n(50)
      player.u1.milestones = []
      player.u1.upgrades = []
      player.u1.points = player.u1.total
      player.u1.exchangedUnstableU1P = zero
      for(i=10;i>=1;i--) rowHardReset(i,"u1")
    }
  }
}
