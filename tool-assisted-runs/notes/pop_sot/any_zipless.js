export default `This is a Zipless TAS of Prince of Persia: The Sands of Time, the game that rebooted the franchise when it was at it's lowest.

%%TOC%%
 
!!! Info / Goal

* Emulator used: [Forum/Topics/23347|BizHawk Dolphin 5.0-16793], then DTM dumped for Dolphin 5.0-16793
* Objective of the run is to reach the credits as fast as possible.
* The use of [https://www.youtube.com/watch?v=dTpKr8yZ1Kw|zipping glitch] is avoided.
** Note: Some of the glitches used in this run might look like what would be considered a "zip" in other games, but zipping specifically refers to the memory corruption glitch that accelerates prince's actions and completely ignores any collision after overloading the rewind system.

!!! Comments

Prince of Persia: The Sands of Time is a game that needs no introduction. This is a zipless TAS of the game, a showcase of how quickly the game can be completed and how much can be skipped just by the means of every glitch other than zipping. The reason why this is a separate category is that the zipping glitch deprecates almost every glitch in this and drastically removes the variety. It would be what's considered a major skip glitch, since even if it technically doesn't skip any area, it sometimes hops from one load trigger to the next 4 times in a row. Meanwhile this run needs to tackle every area differently using the wide array of glitches documented by the community over the last 2 decades. This is especially important when I am dealing with a version of the game that I don't normally play on - GameCube. This fact had minor impact in the NMG run, but here it was much more noticeable and made my some of my assumptions which were based on the PC version wrong.

!!! Tricks and Glitches

I would like to refer to the "Tricks Used" section of my [8278S|NMG run] for the pure movement tricks and recurring gameplay optimizations, as they are also relevant for some part of this run. And I will list the other glitches that are used in this run below.

!! ⏳First Person Glitch (FPG)
This is one of the most versatile glitches in this run. The idea behind this glitch is that when we move the movement stick in a very gradual manner while being in the first person camera, the game doesn't handle that very well and usually results in some kind of drastic action that happens along that direction where the stick was pulled. The exact result depends on where we do it from, so here are the variations that can be seen in this run.
! 🗡️Ledge FPG
When done on a ledge, the prince turns on the ledge at a certain angle. Using this, if we turn straight back, face the other direction, and then turn forward again, it moves the prince ever so slightly away from the edge of the ledge where it's collision ends. If we do it 4 times, there is enough distance created such that when the first person glitch is done perpendicularly this time, the prince can detach from the ledge and walk infinitely in the air. Sometimes the geometry around the ledge allows us to get into that edge of the collision either with a wallrun that can grab the ledge at a precise position or by dropping from a ledge above from a precise spot, which saves us the trouble of having to set up the 4 flips to get the distance. When the prince is in this state, all wall collision is ignored. The only collision that can potentially block the prince is when another ledge that is on the same height as the airwalk, as they can cause the prince to snap to them and lose the detached airwalk state. We can also use the first person glitch to change the angle of airwalk letting us effectively go anywhere. The main limitation of this is that the movement speed in the ledge state is quite slow compared to running and other platforming options, so this glitch is mostly used when a big section can be skipped by the means of going through collision.

! 🗡️Moveable object FPG
Doing FPG while holding a movable object can change the angle the object is facing if the direction is any of the 180° of "forward" directions. But something much more helpful is when it's done in the backward direction. The prince and the object in the direction really quickly, only blocked by any collision that's on the way. And when there is right distance to the collision that's blocking (doors, walls, etc.) it's possible to clip through it.

! 🗡️Swing pole FPG
Just like a ledge, doing it on swing poles also changes the angle the prince is facing. This can be used to instantly turn backwards in some cases, avoiding the really long turnaround animation, and also to turn sideways to snap to something else like ledges on walls.

! 🗡️Fence FPG
When hanging from a fence or a solid edge, we can jump back at a different angle rather than just straight back.

!! ⏳Enemy Clipping
When doing a wallrun flip or a vault while directly colliding with enemy collision, we get pushed out by it. And when we do it near doors, we can get pushed to the other side of the door resulting in a clip. This is possible especially when the enemy is knocked down, as the hitbox size is much bigger during that.

!! ⏳Load Rewinds
This glitch is the single biggest timesaver for this run and the reason why it's less than an hour. When the rewind is used on the exact same frame a load trigger is hit, it causes many effects in the area ahead that is loaded, some positive and some negative. This is not an exhaustive list as every area has nuances when this is done but here are the stuff relevant for this run.
* Cutscenes are disabled - huge timesaver
* Some event triggers like checking for Farah are disabled - good
* Enemies are not loaded - depends on situation if good
* Breakable walls don't break - bad
* Pressure plates and pullable levers that open doors are broken - bad
* Movable items like boxes, statues, mirrors, etc are non-interactable - bad
* Some other interactive elements cause the game to black out or trigger something called a 1fps glitch - bad, but there is some glitch potential here for future

!! ⏳Trap Fall Damage Cancel
At the end of a fall from a large height normally enough to kill the prince, getting hit by a trap takes the prince out of the "falling" state.

!! ⏳Rewind Tricks
When successive rewinds are done in a short span, sometimes a previous action done by the prince restarts completely fresh, but in the new location of the prince, effectively extending the action to enable some skips. They come different flavors - jump, horizontal wallrun, vertical wallrun, wall jump, ledge, drop, and so on. And these variations can take different amount of sands to activate - 2. 3 or 4.

!! ⏳Slo-mo Damage Boost
When the prince performs a certain action while getting hit by an enemy or Farah's arrow, he gets some height. This is massively amplified when it's used with the slomo power. This was one of the biggest problems in this version of the game where because it runs on 30fps compared to the PC version's 60fps, we gain roughly only half the height.

!! ⏳Ledge Storage
When the prince gets hit while trying to climb a fence, that action is stored in memory. When he then proceeds to climb on another solid platform, the stored action gets unleashed, teleporting the prince across the map, only blocked by collision.

!! ⏳Zombie Glitch
If we drop down at precise point after hitting the transition to get out of the underground reservoir, the prince's health becomes zero but because of the cutscene taking over, he is not considered dead. In this state, all the enemies are de-aggroed and in a TAS this is more important for Farah than the prince as the game is much more lenient in checking if Farah is ok. A little fun fact about this glitch is that was found my [https://www.youtube.com/watch?v=r-q61AHmwNM|Mike Uyama] himself.

!! ⏳Rubble Boost
This really has only one use in the run and is basically impossible to control in a real time run. But essentially if we do some action near a crumbing platform, that can result in a massive boost to that action if the distance and angle are just right. The best action I found for this was the torpedo attack.

!!! Stage by stage comments
Usually in this section I try to explain every action exhaustively but here I am going to mention the decisions that I think are noteworthy and my reasoning behind them. For the rest, the above section should cover explanations for what is happening.
!! Pre-Dagger
This part of the run follows the segmented run's route quite closely and my NMG TAS for the first two minutes until the first ledge FPG. A small difference is that instead of a game over, I jump back in-bound to hit a load trigger to load the next area, which ends up being faster due to the slower load times on GC.

!! Dagger to dad fight skip
Here the route completely diverges from the segmented run until dad fight skip. For a long time it is known that the dad fight is skippable but in the PC version, saving and restarting the game after the fight saves a lot of time that would be lost due to the cutscene after the fight. But in GC, it takes just as long to save an load, which makes this skip viable. Now to compensate for the moon pieces that would be gained in this fight, I try to kill as many enemies as possible that are right in my path, starting from the first fight. As mentioned in the next section, this decision might not be correct if we talk purely in terms of time lost vs time gained by doing this. But for the route I had planned, this is what worked out. The other big thing in this section was the cutscene skips with rewinds for which I needed to plan my sands. I could not skip the long cutscene meeting Farah as there was load tied to that cutscene. The dad fight skip itself consists of two big parts - getting back down after hitting the load, without hitting the deload trigger, and getting into the ledge airwalk state low enough such that when I reach the end of the segment I am low enough to drop down to hit the checkpoint before the game considers the prince dead. For the former I had to do a trap fall damage cancel after getting far enough from the deload trigger in the wall, and for the latter I do a double rewind trick off a ledge drop.

!! Warehouse, Zoo, Baths
After the dad fight skip, I take a sand cloud and the final enemy required to finish my moon tank. There is a cutscene skip at the start of the Warehouse which leaves me with just enough sand to do the rewind trick and complete the area. At the zoo I did everything as done in an RTA run but unless I waited for a few seconds, I get a game over because of Farah. This is when I started to realize that the GameCube version has different kind of fail safes. Once I reached the baths, no matter what I did I could not get Farah into what's known as a "twisted neck" state, where is completely stuck, unable to move, and does not fall into the void even if that part of the map deloads. There is a trigger around the part where the second sword is obtained that resets her state. Now this is actually fantastic for NMG, but in this category we need to proceed without worrying about her, but unfortunately we don't get that luxury.

!! Caves, Mess hall, Farah tower
Normally we could skip the scarab fights and waiting for Farah to get to the other side, but that's not possible due to the lack of twisted neck state. I found that rewinding the load trigger prevents the game over in the next area, but the relief is short lived and the very next load trigger causes an instant game over. So the only option was to fight the scarabs and wait for her before using ledge storage to cross the gap. At the mess hall, rewinding the loads serve double purpose of disabling cutscenes as well as the Farah check triggers. Once I reach the farah Tower, I death abuse to load the next area (broken bridge), and once I pull the lever, finally Farah is normal and we won't have to worry about her for a while.

!! Broken Bridge, Waterfall, Reservoir
This was the most fun part of the run to work on where there are a combination of both glitches as well as pure movement. The only "problem" I had was during the OoB section where I could not see anything. But this was such a wonderful problem to have as a TASer after the previous section. The big timesave from the segmented run comes from doing the airwalk in a more striaght path as I am able to micro-adjust the angles. At the end of the reservoir section, the zombie glitch is performed at the transition. The main use of this is that it makes enemies passive and not attack Farah when we leave her behind in the next section.

!! Harem, HoL and Observatory
Unfortunately, Farah makes a comeback to ruin our lives. After clipping out of the Harem with a statue, there is a trigger in the next section that causes and instant game over. So after turning the lever, I had to rewind to disable that trigger, which also disables the cutscene. Sounds good right? Unfortunately it also disables the mirrors that are normally used to do a first person glitch. So I had to resort to a variation of an old method to skip HoL, which is thankfully only slightly slower accounting for the lack of cutscene. One surprising thing about this version was that doing rewinds after leaving Farah behind did not cause game overs like in the PC version, which saved a bit of time in Observatory. After that I drink to get rid of the zombie glitch, as I need enemies to aggro in the next area.

!! HoLC, Prison, Elevator
I use a slomo tank to activate the enemy I use for clipping the door. And then in the next section we need to take the bottom bath to skip some of the Farah triggers, which also let's me complete my 5th sand tank. After falling to the prison I do a relatively new rewind trick to completely skip the descent in this area as TAS can use the box to clip through before the enemies can disturb the prince. After climbing out, I was able to use the two remaining sands to do one last rewind trick which opens the door to go to the bridge to the elevator. Unfortunately I couldn't find a way to skip this fight like in the PC version, and I took help from toca who tried to do it in real time. Our conclusion was that there is some roof collision that blocks the prince from launching up past the elevator's frame, so I proceed to just do the fight.

!! Endgame, Vizier
After some scripted sequence of events, there is another really fun section of the run where we don't have the ability to rewind, but I make full use of the first person glitches to go fast, not to mention the rubble boost. The only funny issue I ran in this part was when the camera got stuck to a swing pole that I skipped with a perpendicular first person glitch, but I was able to mitigate it with the use of the landscape camera in this game. Like in the NMG run, the goal of the last fight is to just complete it without getting block or having to wait too long for enemies to spawn close to the prince, but a bit of RNG manip with the camera produces a fine result. Like the elevator skip, collision differences made Vizier skip not possible, so unfortunately I have to do the most boring boss fight in video game history, at least with rng manips to get the perfect result.

!!! Afterthoughts, Improvements possible
When I started working on this run in 2023, I didn't think too much about the version differences between this and PC. I really thought "at worst it might be more difficult, but this is TAS and I can make it work somehow", and I was gravely mistaken. The project was stalled for a long time because of me moving to other projects and two incredible new PoP games being released in this period. When I finally got back to it, my focus to finish it someway or the other. The worst part about elevator and vizier skips not being possible is that some of the decisions taken in the early game make much less sense after the run is over, something that I could have avoided had I tried those skips directly before working on the run. If I am do a second TAS of this category, I want it to be on the much better PC version of the game (maybe via Windows XP emulation? Maybe directly with wine and libTAS?) but I want to provide a list of decision that would need to be reconsidered if an improvement of this run in the future on GameCube:
* Starting right at the first fight, I think killing the 3 extra enemies for the moon pieces need to be reconsidered (only worth if elevator skip is possible).
* In the Sultan's Chamber, I killed a lot of enemies for the moon pieces, again needs to be reconsidered (only worth if elevator skip is possible).
* Use the first person glitch to turn around instantly in the swing pole before the air walk in booby trapped courtyard.
* In the section before warehouse (and after dad skip), there could be some more investigation done to see if the door can be clipped.
* There are some rewind tricks and camera pan skips in the bird cage sections but with my route the timesave was too little to be worth taking an extra sand cloud.
* The ledge storage can be setup at the scarabs section after the bird cage, and I think that's faster and beneficial.
* When I refilled HP before baths, I took an extra sip in case it's need for any damage boosts to circumvent some triggers (like at messhall) but in the end it wasn't needed.
* Unless there are other problems (which I don't see why it would be), the baths cutscene should be skipped by rewinding.
** This means that you won't be able to do the damage boost, but there is a rewind trick that's almost as fast. You will need to take an extra sand cloud at before baths.
* Investigate more if Farah can be gotten into the twisted neck state at baths after picking the second sword, as it would save you a lot of headache in the following areas.
** If it's possible then you can skip fighting the scarabs and waiting for Farah before using ledge storage.
* I took a sip before the HoLC door clip thinking I would need it for the damage boosts, but turned out none of them were possible.
* Investigate if elevator skip is possible with the combination of rewind tricks and damage boosting from another spot, a fresh pair of eyes might be able to find something.
* Investigate if vizier skip is possible, for the same reason.
And most importantly, do the investigations and start to work on the run only after you are satisfied that you have reached conclusions, planned the HP, sand and moon route, and then start the run, to avoid the mistakes I made. But at the same time, I am still happy with how the run turned out it in the end. Getting the moon tank still had some advantages like warehouse damage boost, HoLC door clip, and a little bit of time save in the elevator fight. Even if it might have not been optimal, the run was a good showcase of pretty much everything that's possible to do with it. In a way it's kind of a superplay. The rewind cutscene skips really helped maintain the flow of the run and made it more entertaining.

!!! Thank You Note
I want to specially thank toca for helping me with ideas and suggestions, as well as trying out some skips during the making of the TAS. I want to thank him, epicdudeguy and Jaka for organizing and doing commentary with me. Thanks to solarplex for the [UserFiles/Info/638009996522613999|partially completed TAS] where I borrowed some tricks from, and likewise to the [https://www.youtube.com/watch?v=AX3kW5yhISs|Segmented run] which was the main reference I used for making this run. I'm grateful to the PoP community for the strategies and support.

Note - The DTM dump doesn't reflect the correct re-record count, which can be seen in my BK2 file [UserFiles/Info/639032316921115579|here].`;