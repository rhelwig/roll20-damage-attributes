// GLOBAL VALUES You might want to change
// These are parameter values we expect
var actionOn = "on";
var actionOff = "off";
// These are the parameter names we expect to see come in to the API call
var param_Target = "target";
var param_dmgType = "type";
var param_action = "set";
var param_mode = "mode";
// these are strings we can search for in the attributes to see if they have the damage type modifier
var searchAdamantine = "damant"; // enough to know we found Adamantine
var searchSilver = "ilver"; // enough to know we found Silvered
var searchMagic = "agical"; // enough to know we found Nonmagical

var damageTypes = ["Acid", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Poison", "Psychic", "Radiant", "Thunder", "Bludgeoning", "Piercing", "Slashing"];
var damageMinorTypes = ["Adamantine", "Silver", "Magic"];

on('ready',function(){
    "use strict";
    log("DamageTypeMods loaded");
    
    function hasTypeOn(theData, minorType){
        // minorType is one of the damageMinorTypes
        //  go through the structure and see how many are on
        var c = {count:0, dmg:[]};
        var x;
        for(x in theData[minorType]){
            if(actionOn === theData[minorType][x]){
                log(x);
                c.count++;
                c.dmg.push(x);
            }
        }

        return c;
    }

    function combineRIVCData(theData){
        // given an object with the data, go through it all to build the string
        // that the character sheet expects for the attribute
        var s = "";
        // first add any of the regular damage types that are set ON
        damageTypes.forEach(function(dt){
            if(actionOn === theData[dt]){
                s += ", " + dt;
            }
        });
        // now go through the special cases
        var c = hasTypeOn(theData, damageMinorTypes[0]);
        if(c.count > 0){
            // we have at least one Adamantine case
            s += "; ";
            log(c);
            if(c.count === 3){
                s += "Bludgeoning, Piercing, and Slashing";
            } else if(c.count === 2){
                s += c.dmg[0] + " and " + c.dmg[1];
            }
            else {
                s += c.dmg[0];
            }
            s += " from Nonmagical attacks that aren't Adamantine";
        }
        c = hasTypeOn(theData, damageMinorTypes[1]);
        if(c.count > 0){
            // we have at least one Silver case
            s += "; ";
            log(c);
            if(c.count === 3){
                s += "Bludgeoning, Piercing, and Slashing";
            } else if(c.count === 2){
                s += c.dmg[0] + " and " + c.dmg[1];
            }
            else {
                s += c.dmg[0];
            }
            s += " from Nonmagical attacks that aren't Silvered";
        }
        c = hasTypeOn(theData, damageMinorTypes[2]);
        if(c.count > 0){
            // we have at least one Magic case
            s += "; ";
            log(c);
            if(c.count === 3){
                s += "Bludgeoning, Piercing, and Slashing";
            } else if(c.count === 2){
                s += c.dmg[0] + " and " + c.dmg[1];
            }
            else {
                s += c.dmg[0];
            }
            s += " from Nonmagical attacks";
        }
        
        log("After: " + s);
        return s.substr(2);
    }

    function parseRIVCData(theData) {
        log("Before: " + theData);
        // we get a string which is the character sheet's attribute data
        //  we need to split it up into an array structure and pass that back.
        var ricv = {    // putting in all the possibilities, defaulted to Off
            Acid: actionOff,
            Adamantine: {
                Bludgeoning: actionOff,
                Piercing: actionOff,
                Slashing: actionOff
            },
            Cold: actionOff,
            Fire: actionOff,
            Force: actionOff,
            Lightning: actionOff,
            Magic: {
                Bludgeoning: actionOff,
                Piercing: actionOff,
                Slashing: actionOff
            },
            Necrotic: actionOff,
            Poison: actionOff,
            Psychic: actionOff,
            Radiant: actionOff,
            Silver: {
                Bludgeoning: actionOff,
                Piercing: actionOff,
                Slashing: actionOff
            },
            Thunder: actionOff
        };
        // parse that sucker, updating ricv accordingly
        var outer = theData.split(";");
        outer.forEach(function (paramOuter, indexOuter){
            //log(paramOuter);
            // is this a section of Silvered, Magical, or Adamantine?
            var adamantine = paramOuter.includes(searchAdamantine);
            var silvered = paramOuter.includes(searchSilver);
            var magic = paramOuter.includes(searchMagic);
            
            damageTypes.forEach(function(dt){
                var s = new RegExp(dt, 'i');
                if(-1 != paramOuter.search(s)){
                    // We have a hit!
                    if(adamantine) {
                        ricv[damageMinorTypes[0]][dt] = actionOn;
                    } else if(silvered){
                        ricv[damageMinorTypes[1]][dt] = actionOn;
                    } else if(magic){
                        ricv[damageMinorTypes[2]][dt] = actionOn;
                    } else {
                        ricv[dt] = actionOn;
                    }
                }
            });
        });
        
        return ricv;
    }

    on('chat:message',function(msg){
        
        if('api' === msg.type) {
            if(msg.content.indexOf("!DamageTypeSet ") !== -1 ){
                // We are being called to modify the damage type this character has resistance, vulnerability, immunity, or condition immunity to
                //log(msg);
		        if(msg.content.indexOf(param_Target) == -1) {
		            sendChat("DamageTypeSet", "/w " + msg.who + " You called DamageTypeSet without having a target specified.");
	        	    return;
    	    	}

                var charToken, dmgType = "", action = "", mode = "", silver = false, magic = false, adamantine = false;

            	var parameters = msg.content.split(/\s+--/);
            	parameters.shift();
            	parameters.forEach(function (param, index) {
    	        	var paramName, paramContent, p;
    	        	p = param.split("=");
    	        	paramName = p[0].toLowerCase();
    	        	paramContent = p[1];
    	        	if(paramName.startsWith(param_Target)){
    	        	    // target is the ID of the token of the character whose stuff is being modified
    	        	    charToken = getObj("graphic", paramContent);
    	        	    if(charToken === undefined) {
    	        	        sendChat("DamageTypeSet", "/w " + msg.who + " No target token found");
    	        	        return;
    	        	    }
    	        	}
    	        	if(paramName.startsWith(param_dmgType)){
    	        	    // type is the damage type (Fire, Cold, Piercing, etc)
    	        	    dmgType = paramContent;
    	        	}
    	        	if(paramName.startsWith(param_action)){
    	        	    // On or Off - are we turning the thing on or off
    	        	    action = paramContent.toLowerCase();
    	        	    if((actionOn != action) && (actionOff != action)){
    	        	        sendChat("DamageTypeSet", "/w " + msg.who + "set parameter unrecognized: " + paramContent);
    	        	        return;
    	        	    }
    	        	}
    	        	if(paramName.startsWith("silver")){
    	        	    // optional parameter, included to indicate silver's effect
    	        	    //  for Resistance and Immunity this implies resistance or immunity to weapons that are NOT silvered
    	        	    //  for Vulnerabilities, this implies vulnerability to weapons that ARE silvered (are there any?)
    	        	    silver = true;
    	        	}
    	        	if(paramName.startsWith("magic")){
    	        	    // optional parameter, included to indicate magic's effect
    	        	    //  for Resistance and Immunity this implies resistance or immunity to weapons that are NOT magical
    	        	    //  for Vulnerabilities, this implies vulnerability to weapons that ARE magical (are there any?)
    	        	    magic = true;
    	        	}
    	        	if(paramName.startsWith("adamantine")){
    	        	    // optional parameter, included to indicate adamantine's effect
    	        	    //  for Resistance and Immunity this implies resistance or immunity to weapons that are NOT adamantine
    	        	    //  for Vulnerabilities, this implies vulnerability to weapons that ARE adamantine (are there any?)
    	        	    adamantine = true;
    	        	}
    	        	if(paramName.startsWith(param_mode)){
    	        	    // which one are we modifying?
    	        	    switch(paramContent){
    	        	        case "R":
    	        	        case "r":
    	        	            mode = "npc_resistances";
    	        	            break;
	        	            case "I":
	        	            case "i":
	        	                mode = "npc_immunities";
	        	                break;
        	                case "V":
        	                case "v":
        	                    mode = "npc_vulnerabilities";
        	                    break;
    	                    case "C":
    	                    case "c":
    	        	            mode = "npc_condition_immunities";
    	        	            break;
    	        	        default: 
    	        	            sendChat("DamageTypeSet", "/w " + msg.who + " improper mode parameter");
    	        	            return;
    	        	    }
    	        	}
                });
                // make sure these got set: charToken, dmgType, action, mode
                if(!mode.startsWith("npc_") || (action.length < 2) || (dmgType.length < 4) || (charToken === undefined)){
                    sendChat("DamageTypeSet", "/w " + msg.who + "missing some parameters");
                }

                // get the character
                var charSheet = getObj("character", charToken.get("represents"));
        	    if(charSheet === undefined) {
                    sendChat("DamageTypeSet", "/w " + msg.who + " No target character sheet found");
    	        	return;
    	        }

                var theList = findObjs({type: 'attribute',
                        characterid: charSheet.get("id"),
                        name: mode
                    });
                var theAttr;
                if((undefined === theList) || theList.length < 1){
                    // there is no such attribute on the character sheet
                    // are we turning it on?
                    if(actionOn === action){
                        // we need to create the attribute object
                        theAttr = createObj("attribute", {
                            name: mode,
                            current: dmgType,
                            max: "",
                            characterid: charSheet.get("id")
                        });
                        if(undefined === theAttr) {
                            sendChat("DamageTypeSet", "/w " + msg.who + "Unable to create " + mode + "attribute for " + charSheet.get("name"));
                        }
                    }
                } else {
                    // there is an existing attribute, we need to modify it
                    theAttr = theList[0];

                    var oldState = parseRIVCData(theAttr.get("current"));

                    // now set the new value into our data structure
                    if(adamantine){
                        oldState[damageMinorTypes[0]][dmgType] = action;
                    } else if(silver){
                        oldState[damageMinorTypes[1]][dmgType] = action;
                    } else if(magic){
                        oldState[damageMinorTypes[2]][dmgType] = action;
                    } else {
                        oldState[dmgType] = action;
                    }

                    // and set the attribute to a stringified version of our data structure
                    theAttr.set("current", combineRIVCData(oldState));
                }
            }
        }
    });
});
