var trueGain = n(0)

function getU1TimeSpeed(){
    var timespeed = n(1)
    timespeed = hasUpgThenMul("u1",13,timespeed)
    timespeed = hasUpgThenMul("u1",14,timespeed)
    timespeed = hasUpgThenMul("u1",45,timespeed)
    timespeed = timespeed.mul(layerEffect("g"))
    timespeed = hasUpgThenMul("g",12,timespeed)
    timespeed = timespeed.mul(buyableEffect("s",12))
    return timespeed
}

function resetU1Upgs(extraKeptUpgs = [],force = false,aReset= false){
  player.u1.t = n(0)
  player.a.cd = n(10)
  if(player.a.cd.lte(0)&&!aReset){
    player.a.points = player.a.points.add(getResetGain('a'))
    player.a.total = player.a.total.add(getResetGain('a'))
    player.a.best = player.a.best.max(player.a.points)
  }
  var kept = extraKeptUpgs
  for(i=41;i<=41;i+=10){
    if(layers.u1.upgrades[i].unlocked()){
      for(a=i-30;a<=i-26;a++) kept.push(a)
    }
  }
  player.u1.upgrades=kept
  if(!force && !aReset){
    player.u1.points = player.u1.total
    player.u1.exchangedUnstableU1P = zero 
  }
  if(aReset){
    player.u1.points = player.u1.points.add(player.u1.total.sub(player.u1.baseUPLastReset).max(0))
    player.u1.baseUPLastReset = player.u1.total
  }
  player.u1.baseUPLastReset = player.u1.total
  doReset(this.layer)
  for(i=10;i>=1;i--) rowHardReset(i,"u1")
}

function getU1PointMult(){
    return layers.u1.gainMult()
}
function getU1TimeExp(){
    return layers.u1.gainExp()
}
function calcU1Point(t = player.u1.t){
    var mult = getU1PointMult()
    var timeExp = getU1TimeExp()
    t = t.pow(timeExp)    
    var point = t.mul(mult)
    return point
}
function costU1Time(cost,getAReturnInsteadOfCost){
    var mult = getU1PointMult()
    var t = player.u1.t
    var timeExp = getU1TimeExp()
    t = t.pow(timeExp)    
    var point = t.mul(mult)
    point = point.sub(cost)
    t = point.div(mult).root(timeExp)
    if(getAReturnInsteadOfCost) return t
    player.u1.t = t
}
function getUnstableU1P(){
  var unstableU1P = zero
  unstableU1P = hasUpgThenAdd("g",11,unstableU1P)
  unstableU1P = unstableU1P.add(layers.s.effect2())
  return unstableU1P.floor()
}

addLayer("u1", {
    name: "universe1", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		    points: new ExpantaNum(0),
        t:n(0),
        exchangedUnstableU1P:n(0),
        confirmWindow:true,
        baseUPLastReset:n(0)
    }},
    color: "lightblue",
    resource: "升级点", // Name of prestige currency
    resourceEN: "Upgrade Points", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new ExpantaNum(1)
        mult = mult.mul(layerEffect("p"))
        mult = mult.mul(layerEffect("b"))
        mult = hasUpgThenMul("u1",15,mult)
        mult = mult.mul(buyableEffect("s",11))
        if(inChallenge("u1",12)) mult = mult.mul(player.g.power.add(1))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        var exp = n(0.5)
        exp = hasUpgThenAdd("u1",12,exp)
        exp = hasUpgThenAdd("u1",24,exp)
        exp = hasUpgThenAdd("u1",33,exp)
        exp = hasUpgThenMul("u1",42,exp)
        if(inChallenge("u1",12)) exp = n(0)
        return exp
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)  QwQ:1也可以当第一排
    buyables: {
        11: {
            cost(x = getBuyableAmount(this.layer, this.id)) {
                var c = four.pow(x.add(1).pow(1.25))
                if(x.gte(24)) c = ten.pow(two.pow(x.add(4).sqrt()))
                return c
            },
            display() { return `+1 升级点.(重置U或A以获得)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />费用:${format(this.cost(getBuyableAmount(this.layer, this.id)))}点数<br>等级:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            displayEN() { return `+1 Upgrade Points.(Do U or A reset to gain)(Tip:U reset means reset U upgs)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />Cost:${format(this.cost(getBuyableAmount(this.layer, this.id)))} Points<br>Level:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            canAfford() { return calcU1Point().gte(this.cost()) },
            buy() {
                costU1Time(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            //buyMax(){
                //var p = hasUpgrade("p",35)? player.p.points.pow(1.25) : player.p.points
                //if(hasUpgrade("p",61)) p = p.root(0.85)
                //var c = p.logBase(1.797e308).add(1).pow(125).sub(getBuyableAmount(this.layer, this.id)).min(upgradeEffect("p",34)).floor().max(0)
                //setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(c))
            //},
            effect(){
                var eff = getBuyableAmount(this.layer,this.id)
                return eff
            },
            //unlocked(){return hasUpgrade("p",25)&&upgradeEffect("p",25).gte(1)},
            abtick:0,
            abdelay(){
                return 1e308
            }
        },
        12: {
            cost(x = getBuyableAmount(this.layer, this.id)) {
                var c = three.pow(x.add(2).pow(1.33))
                if(x.gte(6)) c = three.pow(x.add(2).pow(1.5))
                if(x.gte(18)) c = ten.pow(four.pow(x.sub(10).sqrt()))
                return c
            },
            display() { return `+1 升级点.(重置升级以获得)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />费用:${format(this.cost(getBuyableAmount(this.layer, this.id)))}重置点<br>等级:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            displayEN() { return `+1 Upgrade Points.(Do U or A reset to gain)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />Cost:${format(this.cost(getBuyableAmount(this.layer, this.id)))} Prestige Points<br>Level:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            //buyMax(){
                //var p = hasUpgrade("p",35)? player.p.points.pow(1.25) : player.p.points
                //if(hasUpgrade("p",61)) p = p.root(0.85)
                //var c = p.logBase(1.797e308).add(1).pow(125).sub(getBuyableAmount(this.layer, this.id)).min(upgradeEffect("p",34)).floor().max(0)
                //setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(c))
            //},
            effect(){
                var eff = getBuyableAmount(this.layer,this.id)
                return eff
            },
            unlocked(){return hasUpgrade("p",11)},
            abtick:0,
            abdelay(){
                return 1e308
            }
        },
        13: {
            cost(x = getBuyableAmount(this.layer, this.id)) {
                var c = x.add(1).pow(1.25).floor()
                return c
            },
            display() { return `+1 升级点.(重置升级以获得)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />费用:${format(this.cost(getBuyableAmount(this.layer, this.id)))}倍增器<br>等级:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            displayEN() { return `+1 Upgrade Points.(Do U or A reset to gain)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />Cost:${format(this.cost(getBuyableAmount(this.layer, this.id)))} Boosters<br>Level:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            canAfford() { return player.b.points.gte(this.cost()) },
            buy() {
                player.b.points = player.b.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            //buyMax(){
                //var p = hasUpgrade("p",35)? player.p.points.pow(1.25) : player.p.points
                //if(hasUpgrade("p",61)) p = p.root(0.85)
                //var c = p.logBase(1.797e308).add(1).pow(125).sub(getBuyableAmount(this.layer, this.id)).min(upgradeEffect("p",34)).floor().max(0)
                //setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(c))
            //},
            effect(){
                var eff = getBuyableAmount(this.layer,this.id)
                return eff
            },
            unlocked(){return hasUpgrade("u1",21)},
            abtick:0,
            abdelay(){
                return 1e308
            }
        },
        14: {
            cost(x = getBuyableAmount(this.layer, this.id)) {
                var c = x.add(1).pow(1.25).mul(2).sub(1).floor()
                return c
            },
            display() { return `+1 升级点.(重置升级以获得)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />费用:${format(this.cost(getBuyableAmount(this.layer, this.id)))}发生器<br>等级:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            displayEN() { return `+1 Upgrade Points.(Do U or A reset to gain)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />Cost:${format(this.cost(getBuyableAmount(this.layer, this.id)))} Generators<br>Level:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            canAfford() { return player.g.points.gte(this.cost()) },
            buy() {
                player.g.points = player.g.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            //buyMax(){
                //var p = hasUpgrade("p",35)? player.p.points.pow(1.25) : player.p.points
                //if(hasUpgrade("p",61)) p = p.root(0.85)
                //var c = p.logBase(1.797e308).add(1).pow(125).sub(getBuyableAmount(this.layer, this.id)).min(upgradeEffect("p",34)).floor().max(0)
                //setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(c))
            //},
            effect(){
                var eff = getBuyableAmount(this.layer,this.id)
                return eff
            },
            unlocked(){return hasUpgrade("u1",22)},
            abtick:0,
            abdelay(){
                return 1e308
            }
        },
        21: {
            cost(x = getBuyableAmount(this.layer, this.id)) {
                var c = x.add(1).pow(1.33).floor()
                return c
            },
            display() { return `+2 升级点.(重置升级以获得)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />费用:${format(this.cost(getBuyableAmount(this.layer, this.id)))}时间胶囊<br>等级:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            displayEN() { return `+2 Upgrade Points.(Do U or A reset to gain)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />Cost:${format(this.cost(getBuyableAmount(this.layer, this.id)))} Time Capsules<br>Level:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            canAfford() { return player.t.points.gte(this.cost()) },
            buy() {
                player.t.points = player.t.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            //buyMax(){
                //var p = hasUpgrade("p",35)? player.p.points.pow(1.25) : player.p.points
                //if(hasUpgrade("p",61)) p = p.root(0.85)
                //var c = p.logBase(1.797e308).add(1).pow(125).sub(getBuyableAmount(this.layer, this.id)).min(upgradeEffect("p",34)).floor().max(0)
                //setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(c))
            //},
            effect(){
                var eff = getBuyableAmount(this.layer,this.id).mul(2)
                return eff
            },
            unlocked(){return hasUpgrade("u1",41)},
            abtick:0,
            abdelay(){
                return 1e308
            }
        },
        22: {
            cost(x = getBuyableAmount(this.layer, this.id)) {
                var c = x.add(1).pow(1.33).floor()
                return c
            },
            display() { return `+2 升级点.(重置升级以获得) *空间不会被消耗*<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />费用:${format(this.cost(getBuyableAmount(this.layer, this.id)))}空间<br>等级:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            displayEN() { return `+1 Upgrade Points.(Do U or A reset to gain) *Space won\'t be used*<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />Cost:${format(this.cost(getBuyableAmount(this.layer, this.id)))} Space<br>Level:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            canAfford() { return player.s.points.gte(this.cost()) },
            buy() {
                //player.s.points = player.s.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            //buyMax(){
                //var p = hasUpgrade("p",35)? player.p.points.pow(1.25) : player.p.points
                //if(hasUpgrade("p",61)) p = p.root(0.85)
                //var c = p.logBase(1.797e308).add(1).pow(125).sub(getBuyableAmount(this.layer, this.id)).min(upgradeEffect("p",34)).floor().max(0)
                //setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(c))
            //},
            effect(){
                var eff = getBuyableAmount(this.layer,this.id).mul(2)
                return eff
            },
            unlocked(){return hasUpgrade("u1",43)},
            abtick:0,
            abdelay(){
                return 1e308
            }
        },
        23: {
            cost(x = getBuyableAmount(this.layer, this.id)) {
                var c = ten.pow(two.pow(x.add(9).root(2))).mul(1e4).pow(1.4)
                if(hasUpgrade("u1",44)) c = c.root(1.1)
                return c
            },
            display() { return `+1 升级点.(重置升级以获得)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />费用:${format(this.cost(getBuyableAmount(this.layer, this.id)))}t<br>等级:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            displayEN() { return `+1 Upgrade Points.(Do U or A reset to gain)<br />+${format(buyableEffect(this.layer,this.id),2)}.<br />Cost:${format(this.cost(getBuyableAmount(this.layer, this.id)))} t<br>Level:${formatWhole(getBuyableAmount(this.layer, this.id))}` },
            canAfford() { return player.u1.t.gte(this.cost()) },
            buy() {
                player.u1.t = player.u1.t.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            //buyMax(){
                //var p = hasUpgrade("p",35)? player.p.points.pow(1.25) : player.p.points
                //if(hasUpgrade("p",61)) p = p.root(0.85)
                //var c = p.logBase(1.797e308).add(1).pow(125).sub(getBuyableAmount(this.layer, this.id)).min(upgradeEffect("p",34)).floor().max(0)
                //setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(c))
            //},
            effect(){
                var eff = getBuyableAmount(this.layer,this.id)
                return eff
            },
            unlocked(){return hasChallenge("u1",12)},
            abtick:0,
            abdelay(){
                return 1e308
            }
        },
    },
    clickables: {
        11: {
            canClick(){return true},
            display() {return `重置升级<br />升级点恢复为 ${format(player.u1.total)}.(本轮获得${format(player.u1.total.sub(player.u1.baseUPLastReset))})<br />您在这一轮中获得了${format(player.u1.exchangedUnstableU1P)}临时升级点(当前值:${format(getUnstableU1P())})`},
            displayEN() {return `Reset Upgrades<br />Upgrade Points will be ${format(player.u1.total)}.(Gained ${format(player.u1.total.sub(player.u1.baseUPLastReset))} this turn)<br />You have ${format(player.u1.exchangedUnstableU1P)} temporary Upgrade Points now(Current gained:${format(getUnstableU1P())})`},
            onClick(){
                if(options.ch) if(player.u1.confirmWindow) if(!confirm("确定重置升级?")) return
                if(!options.ch) if(player.u1.confirmWindow) if(!confirm("Are you sure to RESET YOUR U UPGRADES?")) return
                resetU1Upgs()
            }
        },
        12: {
            canClick(){return true},
            display() {return `禁用确认重置弹窗(${player.u1.confirmWindow?'未禁用':'已禁用'})`},
            displayEN() {return `Disable \'Reset Upgrades\' confirm window in U layer(${player.u1.confirmWindow?(options.ch?"未禁用":"Enabled"):(options.ch?"已禁用":"Disabled")})`},
            onClick(){
                player.u1.confirmWindow = !player.u1.confirmWindow
            }
        },
        13: {
            canClick(){return true},
            display() {return `强制进行A重置(CD未到无自动化点奖励)<br />获得${format(player.u1.total.sub(player.u1.baseUPLastReset))}升级点<br />您在这一轮中获得了${format(player.u1.exchangedUnstableU1P)}临时升级点(当前值:${format(getUnstableU1P())})`},
            displayEN() {return `Do \'A\' Force Reset(no AP reward while CD isn\'t over)<br />Gain ${format(player.u1.total.sub(player.u1.baseUPLastReset))} Upgrade Points`},
            onClick(){
                resetU1Upgs(player.u1.upgrades,true,true)
            }
        },
    },
    upgrades: {
        11: {
            description(){return `u${this.id}:解锁节点P.`},
            descriptionEN(){return `u${this.id}:Unlock Node P.`},
            cost(){return n(1)},
        },
        12: {
            description(){return `u${this.id}:t的指数+0.15.`},
            descriptionEN(){return `u${this.id}:time exponent +0.15.`},
            effect(){
                var eff = n(0.15)
                return eff
            },
            effectDisplay(){return `+${format(this.effect())}`},
            cost(){return n(1)},
        },
        13: {
            description(){return `u${this.id}:点数加成时间速率.(*lg(x+1)+1)`},
            descriptionEN(){return `u${this.id}:Points boost Time Speed.(*lg(x+1)+1)`},
            effect(){
                var eff = player.points.add(1).log10().add(1)
                eff = hasUpgThenMul("u1",25,eff)
                return eff
            },
            effectDisplay(){return `x${format(this.effect())}`},
            cost(){return n(1)},
        },
        14: {
            description(){return `u${this.id}:时间加成时间速率.(*lg(x+10))`},
            descriptionEN(){return `u${this.id}:t boost Time Speed.(*lg(x+10)).`},
            effect(){
                var eff = player.u1.t.add(10).log10()
                eff = hasUpgThenMul("u1",25,eff)
                return eff
            },
            effectDisplay(){return `x${format(this.effect())}`},
            cost(){return n(1)},
        },
        15: {
            description(){return `u${this.id}:升级点总数倍增点数.(未获取的也计入)`},
            descriptionEN(){return `u${this.id}:Upgrade Points boost Points.(\'Upgrade Points\' always means total value,based on up next turn).`},
            effect(){
                var eff = player.u1.total.pow(1.25).mul(0.2).add(1)
                if(hasChallenge("u1",11)) eff = eff.pow(player.points.add(1).log10().add(10).log10())
                return eff
            },
            effectDisplay(){return `x${format(this.effect())}`},
            cost(){return n(1)},
        },
        21: {
            description(){return `u${this.id}:解锁倍增器.Tip:你需要一个附近的升级才能购买!`},
            descriptionEN(){return `u${this.id}:Unlock Booster.Tip:You can only buy a upg next to a bought upgrade.`},
            cost(){return n(3)},
            unlocked(){return player[this.layer].total.gte(3)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())}
        },
        22: {
            description(){return `u${this.id}:解锁发生器.`},
            descriptionEN(){return `u${this.id}:Unlock Generator.`},
            cost(){return n(3)},
            unlocked(){return player[this.layer].total.gte(3)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())}
        },
        23: {
            description(){return `u${this.id}:解锁几个P升级.`},
            descriptionEN(){return `u${this.id}:Unlock several P upgrades.`},
            cost(){return n(3)},
            unlocked(){return player[this.layer].total.gte(3)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())}
        },
        24: {
            description(){return `u${this.id}:时间指数+0.15.`},
            descriptionEN(){return `u${this.id}:time exponent +0.15.`},
            cost(){return n(3)},
            unlocked(){return player[this.layer].total.gte(3)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
            effect(){
                var eff = n(0.15)
                return eff
            },
            effectDisplay(){return `+${format(this.effect())}`},
        },
        25: {
            description(){return `u${this.id}:u13和u14效果^1.5.`},
            descriptionEN(){return `u${this.id}:u13's and u14's effects ^1.5.`},
            cost(){return n(3)},
            unlocked(){return player[this.layer].total.gte(3)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
            effect(){
                var eff = n(1.5)
                return eff
            },
            effectDisplay(){return `^${format(this.effect())}`},
        },
        31: {
            description(){return `u${this.id}:解锁倍增器里程碑和升级.`},
            descriptionEN(){return `u${this.id}:Unlock Booster Milestones and Upgrades.`},
            cost(){return n(9)},
            unlocked(){return player[this.layer].total.gte(15)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
        },
        32: {
            description(){return `u${this.id}:解锁发生器里程碑和升级.`},
            descriptionEN(){return `u${this.id}:Unlock Generator Milestones and Upgrades.`},
            cost(){return n(9)},
            unlocked(){return player[this.layer].total.gte(15)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
        },
        33: {
            description(){return `u${this.id}:时间指数+0.2.`},
            descriptionEN(){return `u${this.id}:time exponent +0.2.`},
            cost(){return n(9)},
            unlocked(){return player[this.layer].total.gte(15)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
            effect(){
                var eff = n(0.2)
                return eff
            },
            effectDisplay(){return `+${format(this.effect())}`},
        },
        34: {
            description(){return `u${this.id}:重置点效果^1.2.`},
            descriptionEN(){return `u${this.id}:Prestige Point effect ^1.2.`},
            cost(){return n(9)},
            unlocked(){return player[this.layer].total.gte(15)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
            effect(){
                var eff = n(1.2)
                return eff
            },
            effectDisplay(){return `^${format(this.effect())}`},
        },
        35: {
            description(){return `u${this.id}:解锁U挑战-1. *挑战需要解锁后才能进入!*`},
            descriptionEN(){return `u${this.id}:Unlock U challenge-1. *A challenge must be unlocked before entering!*`},
            cost(){return n(9)},
            unlocked(){return player[this.layer].total.gte(15)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
        },
        41: {
            description(){return `u${this.id}:解锁节点T.*注意:最高解锁升级层数-3及以下的升级会被保留.*`},
            descriptionEN(){return `u${this.id}:Unlock Node T. *Tip:Upgrades below and equal max unlocked row-3 will be kept after your next reset.*`},
            cost(){return n(27)},
            unlocked(){return player[this.layer].total.gte(50)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
        },
        42: {
            description(){return `u${this.id}:时间指数基于升级点倍增.`},
            descriptionEN(){return `u${this.id}:time exponent is boosted based on Upgrade Points.`},
            cost(){return n(27)},
            unlocked(){return player[this.layer].total.gte(50)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
            effect(){
                var eff = player.u1.total.add(10).log10().sub(1).div(5).add(1)
                return eff
            },
            effectDisplay(){return `x${format(this.effect(),3)}`},
        },
        43: {
            description(){return `u${this.id}:解锁节点S.`},
            descriptionEN(){return `u${this.id}:Unlock Node S.`},
            cost(){return n(27)},
            unlocked(){return player[this.layer].total.gte(50)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
        },
        44: {
            description(){return `u${this.id}:解锁U挑战-2.`},
            descriptionEN(){return `u${this.id}:Unlock U challenge-2.`},
            cost(){return n(27)},
            unlocked(){return player[this.layer].total.gte(50)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
        },
        45: {
            description(){return `u${this.id}:发生器数量加成时间速率.`},
            descriptionEN(){return `u${this.id}:Generators boost Time Speed.`},
            cost(){return n(27)},
            unlocked(){return player[this.layer].total.gte(50)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
            effect(){
                var eff = expPow(player.g.points.add(1).mul(10),1.5).div(10)
                return eff
            },
            effectDisplay(){return `x${format(this.effect())}`},
        }, 
        /* 51: {
            description(){return `u${this.id}:升级点加成发生器的效果(即发生器造成的能量产出).`},
            cost(){return n(81)},
            unlocked(){return player[this.layer].total.gte(128)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
            effect(){
                var eff = player.u1.total.div(10).add(1).log10().div(4).add(1)
                return eff
            },
            effectDisplay(){return `^${format(this.effect())}`},
        }, 
        52: {
            description(){return `u${this.id}:解锁ng-1.时间指数+lg(发生器+1)*lg(倍增器+1)/10.`},
            cost(){return n(81)},
            unlocked(){return player[this.layer].total.gte(128)},
            canAfford(){return checkAroundUpg(this.layer,Number(this.id)) && player[this.layer].points.gte(this.cost())},
        },  */
    },
    challenges: {
        11: {
            name(){return "C-1" + (hasUpgrade("u1",this.baseUPG)?"":"<text style='color:red'>(未解锁)</text>")},
            /**/nameEN(){return "C-1" + (hasUpgrade("u1",this.baseUPG)?"":"<text style='color:red'>(Locked)</text>")},
            challengeDescription: "挑战就是没有挑战.<br><text style='color:red'>进入条件:拥有10,000,000t.</text><br>Tip:进入任何U挑战后您的升级会被重置,但花费的升级点不会返还!",
            /**/challengeDescriptionEN: "A challengeful challenge could be NERF-LESS.<br><text style='color:red'>Enter Requirement: 10,000,000t.</text><br>Tip:Entering any U challenges resets your U upgrades,but you WILL NOT get upgrade points back!",
            baseUPG:35,
            onEnter(){
                resetU1Upgs([this.baseUPG],true)
            },
            enterReq(){return player.u1.t.gte(10000000)&&hasUpgrade("u1",this.baseUPG)},
            canComplete(){return player.points.gte(100000000)},
            goalDescription(){return format(ExpantaNum(100000000))+"点数"},
            /**/goalDescriptionEN(){return format(ExpantaNum(100000000))+" Points"},
            rewardEffect(){return player.g.power.add(1).pow(hasUpgrade("u1",this.baseUPG)?3.5:1.75)},
            rewardDescription:"1.倍增器和发生器价格除以(发生器能量+1)^1.75.<text style='color:red'>(如果您解锁了C1,该效果再次^2)</text>.<br>2.基于点数小幅度改善u15公式.",
            /**/rewardDescriptionEN:"1.Booster & Generator cost is divided by (Energy+1)^1.75.<text style='color:red'>(If C1 is unlocked,this effect ^2 again)</text>.<br>2.u15 is slightly boosted based on Points.",
            rewardDisplay(){return `1.价格/${format(this.rewardEffect())}. `},
            /**/rewardDisplayEN(){return `1.Cost/${format(this.rewardEffect())}. `},
            unlocked(){return layers[this.layer].upgrades[this.baseUPG].unlocked()}
        },
        12: {
            name(){return "C-2" + (hasUpgrade("u1",this.baseUPG)?"":"<text style='color:red'>(未解锁)</text>")},
            /**/nameEN(){return "C-2" + (hasUpgrade("u1",this.baseUPG)?"":"<text style='color:red'>(Locked)</text>")},
            challengeDescription: "无时间指数.点数被能量倍增.<br><text style='color:red'>进入条件:拥有1e10t.</text>",
            /**/challengeDescriptionEN: "Wow time exponent seems not so useful now.REMOVE it.<br><text style='color:red'>Enter Requirement: 1e10t.</text>",
            baseUPG:44,
            onEnter(){
                resetU1Upgs([this.baseUPG],true)
            },
            enterReq(){return player.u1.t.gte(1e10)&&hasUpgrade("u1",this.baseUPG)},
            canComplete(){return player.points.gte(1e14)},
            goalDescription(){return format(ExpantaNum(1e14))+"点数"},
            /**/goalDescriptionEN(){return format(ExpantaNum(1e14))+" Points"},
            rewardDescription:`您可以用时间购买升级点. <text style='color:red'>(如果您解锁了C2,其价格开1.1次根).</text>`,
            /**/rewardDescriptionEN:`You can buy Upgrade Points with variable \'t\'. <text style='color:red'>(If C2 is unlocked,its cost is rooted by 1.1).</text>`,
            unlocked(){return layers[this.layer].upgrades[this.baseUPG].unlocked()}
        },
    },

    update(diff){
        trueGain = calcU1Point(player.u1.t.add(getU1TimeSpeed())).sub(calcU1Point())
        player.u1.total = buyableEffect("u1",11).add(buyableEffect("u1",12)).add(buyableEffect("u1",13)).add(buyableEffect("u1",14)).add(buyableEffect("u1",21)).add(buyableEffect("u1",22).add(buyableEffect("u1",23))).floor()
        //if(player.u1.total.gte(81)) player.u1.total = player.u1.total.sub(81).root(1.5).add(81).floor()
        player.u1.t = player.u1.t.add(getU1TimeSpeed().mul(diff))
        player.points = calcU1Point()
        player.u1.points = player.u1.points.add(getUnstableU1P().sub(player.u1.exchangedUnstableU1P).max(0))
        player.u1.exchangedUnstableU1P = player.u1.exchangedUnstableU1P.max(getUnstableU1P())

        if(player.u1.activeChallenge) if(!hasUpgrade("u1",layers.u1.challenges[player.u1.activeChallenge].baseUPG)) player.u1.activeChallenge = null
    },
    doReset(resettingLayer){
        player.u1.t = n(0)
    },
})
