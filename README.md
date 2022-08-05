# Custom Stats - 0.1

## GENERAL
No Man's Sky mod allowing to custom stats of freighters, ships and multitools newly encountered.

## REQUIREMENTS
- No Man's Sky 3.98 ENDURANCE

## VERSIONS
- MAX: all the minimal values equal to their respective maximum. Meaning that all C fighter ships will have 10 damage as base stat and all S exotic ships will have 60 shield, for example. This is a buff, but respects the game limits.
- OVERKILL: all stats are equal to 100. This is too much.
- BROKEN: all stats are equal to 999. Your 3-year-old daughter will finally be able to kill those sentinels.
- LUA: included for customization, merging, and updating.

## INSTALLATION
- Unzip the zip file
- Pick the desired pak from the zip file
- Copy the desired pak file to No Man's Sky/GAMEDATA/PCBANKS/MODS
- Delete No Man's Sky/GAMEDATA/PCBANKS/DISABLEMODS.txt

## AMUMSS
- Download: https://github.com/MetaIdea/AMUMSS-nms-auto-modbuilder-updater-modscript-system
- Guide: https://stepmodifications.org/wiki/NoMansSky:AMUMSS_Guide

## CUSTOMIZATION
- Edit the values in the LUA file and save it
- Put it in AMUMSS/ModScript
- Run BUILDMOD.bat
- Get your new pak in AMUMSS/Builds
- Follow installation guide from step 3

## UPDATE
If I'm late updating the pak files after a game update, follow the customization guide without editing the LUA script.

## CONFLICTS
This mod will conflict with any mod editing METADATA\REALITY\TABLES\INVENTORYTABLE.MBIN
However, it can be merged easily using AMUMSS and the LUA script provided (see AMUMSS section above).
You can also ask someone nicely to merge the mods for you.

##  CREDITS
- AMUMSS
- Booti386 for his help and his javascript generating the LUA variables and tables like a boss