# roll20 Damage Management
Scripts for managing damage attributes for 5e character sheets on Roll20

To use this you need to install the DamageTypeSet.js API on your game on Roll20. The API can be called directly from the chat window, but you can also use the macros included here to make it easier.

By default, there isn't an attribute on player character sheets for these, so I'm using the NPC sheet's attributes. Since they don't exist and aren't used on the player sheet, we can just use them there, causing no harm that I am aware of. So after using this, characters will have attributes "npc_resistances", "npc_immunities", "npc_vulnerabilities", and "npc_condition_immunnities".

This is all to set thigs up to allow for better automation. Once all the PC, NPC, and Monster characters have these attributes set up then coding solutions that query them to assess damage properly will be possible. For example, an API script could be written to check for resistance to fire damage and then directly apply the correct amount of damage to a target.

The Conditions, Immunities, Resistances, and Vulnerabiliies macros are chat macros. There is nothing preventing a player from using them. Most of the time these would only be used during character creation, but some characters might have abilities that can turn them on or off, such as the Absorb Elements spell which gives temporary resistance to an element. Spell macros such as that could be edited to call the DamageTypeSet API.

## DamageTypeSet
The exposed API call DamageTypeSet takes the following parameters:
target=*<TokenDI>*
type=*<DamageTypeOrCondition>*
set=[on|off]
mode=[C,I,R,V]
silver (optional)
magic (optional)
adamantine (optional)
  
Example:
`!DamageTypeSet --target=-MB_wBNsNuqxW5R3ajMX --type=Charmed --set=off --mode=C`

**Note:** currently it doesn't properly case the types you pass in, so passing in a value with the first letter uppercase is suggested.

## To Come Soon
### Hunter's Mark, Hex, Hexblade's Curse
These have had a first version tested and they look good. However, they do need some serious rewriting to allow for more than one warlock or ranger in the party.

### The Horde
Imagine a horde of zombies, some being spawned from a spawn-source every turn, all taking their turns automatically. As the turn tracker moves to their turn, the zombie will move towards a food source (BRAINS! [Int > 2]) and if they get close enough they will attack. The move, attack, and damage will all occur quickly without needing DM intervention - it will just happen. You'll see swarms of zombies all take their turns in quick succession. [I just need to double-check to see if an API scipt can do the End of Turn deal]
