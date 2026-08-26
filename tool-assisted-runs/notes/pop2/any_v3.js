export default `This is the DOS version of Prince of Persia 2: The Shadow and the Flame, second game in the classic franchise which consists games spanning multiple generations.
!!Game objectives
*Emulator used: PCem v17+st-1 in libTAS 1.4.3
*Config: Early 90s package
*MD5 Hashes of relevant files are given at the end.
*Game Version: IR (Initial Release)
*The objective of the run is to complete the game, which is this case means saving the princess from the evil Jaffar.
*There are plenty of glitches used for various skips and sequence breaks. The most notable one is wall clipping, which is used to skip major portions of various levels. It and the other glitches are explained in the level-wise comments below.
*We control only one character in the run - the prince.

!!Alternate Encodes:
! Input Viewer and in-game frame counter:
[module:youtube|v=VgSzpFG7NHU]
This shows that the in-game is 13:32.83 at 12fps. This helps in accurate comparison to RTA records.
! Commentary with Samabam:
[module:youtube|v=Ikz2azVfqyc]

!!Comments
This is a game which features both plenty of glitches and satisfying movement. Almost all the inputs can be buffered in this game. Unlike its predecessor, this game is relatively more free of RNG, mainly because of the strategies being devised in such a way that enemies are dealt with as little as possible. This is the fourth edition of this TAS. I did not submit the [UserFiles/Info/637766954513149096|third edition] because as much as there were a lot of improved tech like sword clipping, I really did not want another run with the PC Speaker (which is the only sound device that didn't crash the game in JPC-RR). The fact that the PC speaker sounds are annoying was one of the major criticisms of the published [4531M|second edition] as well. Thanks to new PCem + libTAS setup, this is no longer a limitation, and one of my biggest motivation to do an improvement.

!!Stage by stage comments
! Level 1
Right at the start you can get a glimpse of how its possible to take advantage of the guard AI in this game, as we breeze past through the first set of guards after some special movement to deal with the very first one. As we advance further, we take a hit from a guard to get our swords out quicker and one-shot him. A little further, we hit a checkpoint and immediately restart to cancel the prince's stagger and get up animation which takes quite a while. From there we proceed to escape in the ship. At the right moment, its possible to skip the end level jingle and the cutscene by pressing esc followed by space in quick succession.
! Level 2
This level is arguably the most RNG part of the run. I set the system time of 32s at the start specifically for getting an optimal pattern here. The following copy-protection screen needs the correct symbols to be entered. Luckily unlike in the original game it wastes no time (atleast in a TAS) as inputs can be buffered just like in the initial command screen. Its also worth noting that the space button is used to cancel any sort of fading menus throughout the run.
! Level 3
This level has a shorter path to the exit, but for the completion of this game, we require a total of nine health upgrade potions (including the 3 we have at the start), we will get to the reasons later. After getting to the nearest potion in this level, the wall-clipping is used for the first time in the run to get quick access to an otherwise farther exit door. The way clip works is when standing still close enough to a wall facing away from it, it is possible to run through the wall for a certain distance before it pushes the prince out. but if we do a turn around, the prince gets struck in the wall or comes through the other side if the wall is narrow enough. After that we takeout our swords and put it away to clip further. This tech is what I dub 'sword clipping'.
! Level 4
Once again this level has a slightly faster way of reaching the exit using a floating potion, but we do a small detour to collect another health upgrade potion. On our way, we perform a new wall clip which was not faster before but sword clipping makes it faster. After some optimised movement to the exit button, we do a special kind of wall-clip that doesn't require anything special in terms of input execution. For some reason, if a wall clip is performed at the very end of the map, it warps the prince back a couple of rooms in the opposite direction. From there we simply run to the exit.
! Level 5
At the start of this level we do some specific movement to get past the skeleton and the next section with some contraptions to reach the carpet room. After that follows the biggest clip of the run that spans several blocks to reach a room with a health upgrade potion. This skip would be faster regardless of the existence of the potion but we get it as an added bonus in this route, avoiding a sidetrack to get to it. From there we run to the end of the level. We do a little checkpoint restart before the bridge section both to setup a good position for jumping through the skeleton and also because the movement is faster.
! Level 6
This level is the primary reason why the IR version of the game is used. For some reason the starting door of the level is open and allows us to exit straight to the next level.
! Level 7
We start the level with some movement stuff and then get straight to the first clip. Its a very short clip but one of the biggest timesaves of the run as it leads directly to a potion room just like in level 5. After dealing with the medusa head and drinking the potion, we do another little clip to get out of there really quickly. As we proceed further we meet the first sword trap. We avoid having to crawl under them at all costs as its slow so we either bunny hop or in some cases its possible jump through them altogether. In this case we have to do the former. After the dealing with the medusa head in the next room we do another clip to get to the room with the exit door buttons. We can also jump through the trap in that room and also stand close enough to the room with the door without actually having to go through the room transition to exit through it.
! Level 8
We quickly perform a save and load to avoid a known crash in this level. After the climb down at the start, we perform a clip instead of crawling under the hole especially so that can also avoid the trap after with bunny hops, which overall ends up being faster. We jump our way through the the end long corridor where we are conveniently aided by a medusa head to clip through the door. This glitch is possible even without the head but here it just helped even more. We pickup the sword and skip the cutscene. This is where the game would crash if not for the save/load at the start. After that we do specific movement in the next rooms to avoid as many medusa heads as possible to reach the exit.
! Level 9
This level is again fully movement to avoid medusa heads. At the very end, we do a little trick with our sword actions to avoid falling with a falling tile to reach the horse.
! Level 10
The graphics of this level fails to load as we skip the previous cutscene. Luckily the collision/interactions all work normally which is more than enough for us to reach the exit and finish this short level.
! Level 11
This is by far the longest level of the run. First we have a movement section, then we do a little clip to get to the potion quicker. Then after more movement we reach a checkpoint which we restart to stop our momentum quickly. Then we deal with the guards in the next section. By taking out our sword and buffering inputs, we can get a little bit into the next room without aggroing the guards, which allows us to completely skip him. And for the next guard, we use the closing door to push him to his death. We do more movement, trap dodges, wall-clips to finish the level, the usual stuff.
! Level 12
This level starts straight with a wall clip to avoid going around using the door to the left. We do another clip to skip a small climbing section and then its a straight path to the level exit.
! Level 13
This level starts with some specific movement to tightly get under the door as well setup position for jumping through the sword trap. The rest of the level is just more specific movement to get through the guards by slowing down as little as possible. Near the flame, two cool things. One, the guard just get confused and falls off if we stand at a specific spot before he notices us. And second, we don't have to do the flame shenanigans, we can just return without doing anything with it as the only thing we need is for the trigger to open the exit door to be hit, which is luckily not tied to the flame interaction. Also we pickup a health upgrade potion on the way back to the exit.
! Level 14
In this level, normally we would need to have 11 potions to get to the flame form, which is achieved by continuously turning left and right alternatively. But we can do so with nine potions only with a clever trick. By placing ourselves really close to the cutscene trigger at the start, we can use the cutscene to interrupt the animation of turning into the shadow which is what normally happens if we have only 9 potions. At the end of cutscene, we magically appear in the flame form, albeit in a slightly different graphics which arguably looks cooler. We proceed to take down the clones of Jaffar. We need to kill only 2 because game counts the prince's body as well, but since we left it in the previous level, the game miscalculates the number of remaining clones. Then we take Jaffar himself by following a specific path at the end chase segment to finish him off quickly.

!!Final Thoughts and acknowledgements
This was a fun little project, and I was happy to revisit the game and its nice to have a new movie with good sound as well as more optimisations. PS: The time of the movie seems slower, but considering the fact that the boot takes 35 seconds, it beats the current publication by about 15 seconds, assuming the emulators run the game at relatively the same speed.
! Suggested Screenshot:
Frame #82543

!!Files used with MD5 hashes
!Files used to make the image:
 457a1d83eba4a894596d10d8877f63b7  SNDDRVRS/DDISNEY.DRV
 b51a3e481e975016d2efe19a071c4ecc  SNDDRVRS/DMVISION.DRV
 d345b258c540574d9b752ede0ee26a7e  SNDDRVRS/DPS1.DRV
 d4dc2221531b667a28c87aae1182f3a9  SNDDRVRS/DSBLAST.DRV
 a651165c22735d0907bd03be220a33ce  SNDDRVRS/DSB_PRO.DRV
 6b85bce568f03075351a8bd77c297646  SNDDRVRS/DTANDY.DRV
 5a9139ceedbbc58733b7dbff28371dab  SNDDRVRS/MADLIB.DRV
 583dcfaec1cfb3e72f1cd3891414c24a  SNDDRVRS/MCMS101.DRV
 558751b791c09d823b0b65513aee129c  SNDDRVRS/MMPU401.DRV
 cb674373c8bae208dc35740963d165f1  SNDDRVRS/MMVISION.DRV
 b6db35cf66c6d69d51acce45be441aff  SNDDRVRS/MPS1.DRV
 27f67e23bfa16802d20223dcc9579000  SNDDRVRS/MSBLAST.DRV
 fedd8ddb6fc5284b30371d7cc9354461  SNDDRVRS/MSB_PRO.DRV
 17f3c54b7ba94c9f8b3fff3f043398d6  SNDDRVRS/MTANDY.DRV
 e2d7d86aa85fcaf2024ee9e788d8c329  SNDDRVRS/PRESET32.DEF
 86358ab0ab40d52353fa7b07e9d42a5d  SNDDRVRS/PRESET33.DEF
 a7bb7ed8811c6bd9377b26df6b2ed94b  SNDDRVRS/PRESET40.DEF
 1b5af5b0f244a0a1a7c4e84f6f1a4df6  SNDDRVRS/PRESET41.DEF
 f1b96f5882f697647afe84f4f33f8c4a  BIRD.DAT
 c9af41ef358d593a00732a6f1d797076  CAVERNS.DAT
 3298c38de30a5fec23de99c1f70f25d1  CONFIG.DAT
 7795b9ad4c3b20dd93e5e4def93a162f  DESERT.DAT
 d4dc2221531b667a28c87aae1182f3a9  DIGI.DRV
 6e84b43eb28068f6aeae39a586cc2f88  DIGISND.DAT
 3c39cf12c722692a63db19dbc8bed025  FINAL.DAT
 e632701500ce6142f1cfd4f48b5be7b1  FLAME.DAT
 73777d652277512aab0696eed747e571  FRAGSND.DAT
 23cb6b033ff67236cbaaee54165f44af  GUARD.DAT
 055d464ee4fe8efc714f314d7c018339  HEAD.DAT
 7d7e242cd326064a6e5aba5f151a795e  IBMSND.DAT
 7a05436cf5249eec184d092213d01f61  JINNEE.DAT
 dac526e59ec18cb1eebb0dda6d78f171  KID.DAT
 27f67e23bfa16802d20223dcc9579000  MIDI.DRV
 2d3f03861be8da72b2847602cd1ad924  MIDISND.DAT
 100466e19b56067fa0fb97ff86b9e9df  NIS.DAT
 017897dd13be11ca63e4a590787826fb  NIS3VC.DAT
 48ab6c7e846bd40c57e7292f74fa501c  NISDIGI.DAT
 b45e005e677af8475d0000232141bb05  NISIBM.DAT
 3c18cbe26222da1d071315bb9a2e191c  NISMIDI.DAT
 86358ab0ab40d52353fa7b07e9d42a5d  PRESETS.DEF
 9264767b75539d55b2e93c93e6691503  PRINCE.DAT
 7bcdb72c92dc661eea0297bf0794d3e4  PRINCE.EXE
 0d476778f54ef1e8044df43d24dfa727  PRINCE.ICO
 13cae8e658e0ca4f75c56b1fc424e150  PRINCE.OPT
 a340119c34a591287a19427531ae4f7d  ROOFTOPS.DAT
 e448822afd5d374807c1d22c51fb248c  RUINS.DAT
 209e68d914626fe58115db6c1cef040f  SEQUENCE.DAT
 68c64d0d7343173690994d2a03af22bd  SETUP.CFG
 887e1c75b4d091de853894e5d216d035  SETUP.DAT
 caaf9244838030bbec1274523f2a39ec  SETUP.EXE
 211d8c4c2fe018cc1d1c2c71b085c823  SKELETON.DAT
 ec32a75c2cf55ad1bfe3bb60f1229a35  TANDYSND.DAT
 7e87b470058b67574d10c670229a3df1  TEMPLE.DAT
 b11d855671c2601c642dcadabee06eb5  TRANS.DAT
!The image:
 3cb2f35c8e660b5073ad8d34f29ab2b5  ~/.pcem/imgs/pop2ir.iso
!ROM files:
 15d245587d08979f16383190c55fb153  ~/.pcem/roms/pb570/1007by0r.bio
 7138354ba08f606ba51df60c18015635  ~/.pcem/roms/pb570/gd5430.bin1
 d4ba691ce5e04d950ca7624050e6b409  ~/.pcem/roms/pb570/gd5430.bin
 03207098cea070b325d9e1c6f46f5938  ~/.pcem/roms/pb570/flash.bin
 26d8f651e468874e852bdd1ffb6e6804  ~/.pcem/roms/pb570/1007by0r.bi1
!Steps to reproduce flash.bin
If flash.bin is missing and you get a checksum error in the boot screen, boot pcem outside of libTAS once, and you will get the same error. Now just close the app and the file should be created now and you can run the movie in libTAS.`;