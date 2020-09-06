# roll20-damage-attributes
Scripts for managing damage attributes for 5e character sheets on Roll20

To use this you need to install the DamageTypeSet.js API on your game on Roll20. The API can be called directly from the chat window, but there will be macros to make it easier.

Currently there is a macro for Resistances, which displays buttons to turn individual resistances on or off, including for silvered and adamantine weapons as well as simply requiring magical weapons.

By default, there isn't an attribute on player character sheets for these, so I'm using the NPC sheet's attributes. Since they don't exist and aren't used on the player sheet, we can just use them there, causing no harm that I am aware of. So after using this, characters will have attributes like "npc_resistances".

This will allow for better automation. Once all the PC, NPC, and Monster characters have these attributes set up then coding solutions that query them to assess damage properly will be possible. For example, an API script could be written to check for resistance to fire damage and then directly apply the correct amount of damage to a target.
