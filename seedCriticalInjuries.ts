import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const injuries = [
    // --- CRUSH CRITICAL INJURIES (Table 3-1) ---
    { type: 'Crush', severity: 1, minRoll: 1, maxRoll: 5, name: 'Weak Blow', effect: 'Strike sends a cloud of dust. Target coughs and suffers 1 strain.' },
    { type: 'Crush', severity: 1, minRoll: 6, maxRoll: 10, name: 'Knee Whack', effect: 'Foe is limping. Foe treats all terrain as Difficult Terrain until the end of their next turn.' },
    { type: 'Crush', severity: 1, minRoll: 11, maxRoll: 15, name: 'Stomped Foot', effect: 'Is that a tear in the target\'s eye? Foe removes one Boost die from next check.' },
    { type: 'Crush', severity: 1, minRoll: 16, maxRoll: 20, name: 'Its a Knockout', effect: 'Hit knocks all air out of foe. Target cannot suffer strain voluntarily until the end of their next turn.' },
    { type: 'Crush', severity: 1, minRoll: 21, maxRoll: 25, name: 'Off-Balance', effect: 'Add 1 Setback die to the target\'s next skill check.' },
    { type: 'Crush', severity: 1, minRoll: 26, maxRoll: 30, name: 'Powerful Swing', effect: 'Attack misses the target\'s face by an inch. Target is distraught and suffers 3 strain.' },
    { type: 'Crush', severity: 1, minRoll: 31, maxRoll: 35, name: 'Head Strike', effect: 'Foe momentarily forgets their name and cannot upgrade next check with proficiency dice.' },
    { type: 'Crush', severity: 1, minRoll: 36, maxRoll: 40, name: 'Elbow Shot', effect: 'Tremors run up target\'s arm. Remove 1 Ability die from target\'s next check (before upgrading).' },
    
    { type: 'Crush', severity: 2, minRoll: 41, maxRoll: 45, name: 'Back Blow', effect: 'The target is knocked prone and suffers 1 strain.' },
    { type: 'Crush', severity: 2, minRoll: 46, maxRoll: 50, name: 'Concussion', effect: 'The target is Disoriented until the end of the encounter.' },
    { type: 'Crush', severity: 2, minRoll: 51, maxRoll: 55, name: 'Mild Brain Damage', effect: 'The target must increase the difficulty of all Agility and Intellect checks by one.' },
    { type: 'Crush', severity: 2, minRoll: 56, maxRoll: 60, name: 'What was that?', effect: 'Target adds 2 Advantage to all Intellect and Cunning checks until Critical is healed.' },
    { type: 'Crush', severity: 2, minRoll: 61, maxRoll: 65, name: 'Blowback', effect: 'Strike sends foe flying to short range. Foe falls prone and suffers 2 strain.' },
    { type: 'Crush', severity: 2, minRoll: 66, maxRoll: 70, name: 'Face Strike', effect: 'Remove one Ability die from all of foe\'s checks (to a minimum of 1, before upgrading).' },
    { type: 'Crush', severity: 2, minRoll: 71, maxRoll: 75, name: 'Smashed Fingers', effect: 'Upgrade the difficulty of all foe\'s checks employing that hand once (GM chooses hand).' },
    { type: 'Crush', severity: 2, minRoll: 76, maxRoll: 80, name: 'Gear Compromised', effect: 'All attacks vs. the target gain the Sunder quality.' },
    { type: 'Crush', severity: 2, minRoll: 81, maxRoll: 85, name: 'Winded', effect: 'Target cannot voluntarily suffer strain to activate any abilities or gain additional maneuvers until this Critical Injury is healed.' },
    { type: 'Crush', severity: 2, minRoll: 86, maxRoll: 90, name: 'Gaping Wound', effect: 'When foe suffers a critical injury, they suffer an additional 2 wounds.' },
    
    { type: 'Crush', severity: 3, minRoll: 91, maxRoll: 95, name: 'Compound Leg Fracture', effect: 'Bone is visible and it\'s not pretty. Target suffers 1 wound each time they make a maneuver.' },
    { type: 'Crush', severity: 3, minRoll: 96, maxRoll: 100, name: 'Smashed Kneecap', effect: 'Foe treats all terrain as Difficult Terrain until this critical is healed.' },
    { type: 'Crush', severity: 3, minRoll: 101, maxRoll: 105, name: 'Hand Smash', effect: 'Attack flattens target\'s weapon hand. It resembles a bloody pita bread now and cannot be used.' },
    { type: 'Crush', severity: 3, minRoll: 106, maxRoll: 110, name: 'Temporary Amnesia', effect: 'Foe cannot upgrade one characteristic\'s skill checks with proficiency dice.' },
    { type: 'Crush', severity: 3, minRoll: 111, maxRoll: 115, name: 'Crushed Vitals', effect: 'Foe must upgrade the difficulty of all checks once until critical is healed. All of foe\'s allies witnessing the strike suffer 1 strain in horror.' },
    { type: 'Crush', severity: 3, minRoll: 116, maxRoll: 120, name: 'Shattered Rib Cage', effect: 'Blow shatters ribs with a loud crack. Foe must upgrade difficulty of all Brawn and Agility checks twice. Any result of Despair can be spent to have foe suffer an additional critical.' },
    { type: 'Crush', severity: 3, minRoll: 121, maxRoll: 125, name: 'Knocked Senseless', effect: 'The target is staggered until this Critical Injury is healed.' },
    { type: 'Crush', severity: 3, minRoll: 126, maxRoll: 130, name: 'Permanent Amnesia', effect: 'Target loses a skill rank in their most developed skill, permanently. Roll for ties.' },

    { type: 'Crush', severity: 4, minRoll: 131, maxRoll: 140, name: 'Cracked Skull', effect: 'Target suffers 4 wounds and 4 strain and is Disoriented until critical is healed. Everyone in engagement is showered in blood and is Disoriented until end of next round.' },
    { type: 'Crush', severity: 4, minRoll: 141, maxRoll: 150, name: 'Formidable Strike', effect: 'The attack sends shattered bone fragments into vital organs. Unless treated, foe dies at end of next round in agonizing pain.' },
    { type: 'Crush', severity: 4, minRoll: 151, maxRoll: 999, name: 'Death Blow', effect: 'Huge slam collapses foe\'s chest into itself, crushing major organs. Death is instantaneous.' },

    // --- PUNCTURE CRITICAL INJURIES (Table 3-2) ---
    { type: 'Puncture', severity: 1, minRoll: 1, maxRoll: 5, name: 'Uncanny Twist', effect: 'A quick assault forces foe to twist hilariously. -1 to foe\'s defenses on next attack vs. foe.' },
    { type: 'Puncture', severity: 1, minRoll: 6, maxRoll: 10, name: 'Face Scratch', effect: 'Foe spits some blood and suffers 2 strain due to lost morale.' },
    { type: 'Puncture', severity: 1, minRoll: 11, maxRoll: 15, name: 'Pinned', effect: 'Foe is pinned to a surface and is Immobilized until they spend a maneuver to free themselves.' },
    { type: 'Puncture', severity: 1, minRoll: 16, maxRoll: 20, name: 'Futile Dodge', effect: 'Foe\'s futile attempts to dodge and parry discourages their allies causing any engaged with foe to suffer 1 strain.' },
    { type: 'Puncture', severity: 1, minRoll: 21, maxRoll: 25, name: 'Shoulder Stab', effect: 'Oh, the pain! Target suffers 1 strain and must add 1 Advantage to their next check.' },
    { type: 'Puncture', severity: 1, minRoll: 26, maxRoll: 30, name: 'Open Childhood Wound', effect: 'Foe must spend +1 Story Points to activate any effects until end of next round.' },
    { type: 'Puncture', severity: 1, minRoll: 31, maxRoll: 35, name: 'Twist the Knife', effect: 'Target cries in agonizing pain and suffers 2 additional wounds.' },
    { type: 'Puncture', severity: 1, minRoll: 36, maxRoll: 40, name: 'Frantic Defense', effect: 'Foe must perform the Guarded Stance maneuver on their next 2 turns.' },
    
    { type: 'Puncture', severity: 2, minRoll: 41, maxRoll: 45, name: 'Side Swipe', effect: 'An effective hit to foe\'s side. Foe treats all terrain as Difficult Terrain until end of encounter.' },
    { type: 'Puncture', severity: 2, minRoll: 46, maxRoll: 50, name: 'Head Ringer', effect: '+1 difficulty to target\'s Intellect and Cunning checks until Critical Injury is healed.' },
    { type: 'Puncture', severity: 2, minRoll: 51, maxRoll: 55, name: 'Deep Wound', effect: 'Target suffers 1 strain each time they perform their free maneuver.' },
    { type: 'Puncture', severity: 2, minRoll: 56, maxRoll: 60, name: 'Swashbuckling', effect: 'All foes in short range lose morale. Add 1 Advantage to hostile checks foes make until end of encounter.' },
    { type: 'Puncture', severity: 2, minRoll: 61, maxRoll: 65, name: 'Exposed Weakness', effect: 'An accurate strike exposes a weakness. All attacks vs. foe gain Pierce 1 quality.' },
    { type: 'Puncture', severity: 2, minRoll: 66, maxRoll: 70, name: 'Not the Eyes', effect: 'Add 1 Setback to all checks requiring vision (including attacks).' },
    { type: 'Puncture', severity: 2, minRoll: 71, maxRoll: 75, name: 'Neck Shot', effect: 'Foe suffers 1 wound at start of their turn until healed at least 1 wound or 1 strain by any means.' },
    { type: 'Puncture', severity: 2, minRoll: 76, maxRoll: 80, name: 'Spun Around', effect: 'For loses balance. All attacks vs. the target gain the Knockback quality.' },
    { type: 'Puncture', severity: 2, minRoll: 81, maxRoll: 85, name: 'Vital Organ Damage', effect: 'Target suffers 2 strain. In addition, their Strain Threshold is reduced by 2 until this Critical Injury is healed.' },
    { type: 'Puncture', severity: 2, minRoll: 86, maxRoll: 90, name: 'I Loosened it for You', effect: 'All attacks vs. the target gain the Vicious 1 quality until critical is healed.' },
    
    { type: 'Puncture', severity: 3, minRoll: 91, maxRoll: 95, name: 'Head Graze', effect: 'All attacks vs. target gain the Stun 2 quality until this Critical Injury is healed.' },
    { type: 'Puncture', severity: 3, minRoll: 96, maxRoll: 100, name: 'Scraped Eye', effect: 'Foe upgrades difficulty of all checks requiring vision once; Perception and Vigilance twice.' },
    { type: 'Puncture', severity: 3, minRoll: 101, maxRoll: 105, name: 'Efficient Disarm', effect: 'Foe is disarmed of their main weapon. It cannot be used until end of encounter.' },
    { type: 'Puncture', severity: 3, minRoll: 106, maxRoll: 110, name: 'Hindering Injury', effect: 'Decrease the difficulty of all attacks vs. target by 1 to a minimum of 1.' },
    { type: 'Puncture', severity: 3, minRoll: 111, maxRoll: 115, name: 'Temporary Disabled', effect: 'The target is Immobilized until this Critical Injury is healed.' },
    { type: 'Puncture', severity: 3, minRoll: 116, maxRoll: 120, name: 'Major Artery Hit', effect: 'Foe must immediately make an Average(2) Resilience check (incidental) or become Incapacitated until healed at least 1 wound or 1 strain by any means.' },
    { type: 'Puncture', severity: 3, minRoll: 121, maxRoll: 125, name: 'Penetrating Shot', effect: 'Attack goes through a limb. Foe is Immobilized and suffers 1 wound for each action taken.' },
    { type: 'Puncture', severity: 3, minRoll: 126, maxRoll: 130, name: 'Gruesome Injury', effect: 'Target permanently lowers one characteristic by one.' },

    { type: 'Puncture', severity: 4, minRoll: 131, maxRoll: 140, name: 'Punctured Lung', effect: 'Foe gasps for air and starts to Suffocate until Critical is healed. At the beginning of their turn, foe suffers 3 strain and, if exceeded their Strain Threshold, 1 Critical Injury.' },
    { type: 'Puncture', severity: 4, minRoll: 141, maxRoll: 150, name: 'Frenzied Stabs', effect: 'A series of thrusts riddle foe with holes turning them into a fountain of blood. Unless treated, foe drops dead at the end of next round.' },
    { type: 'Puncture', severity: 4, minRoll: 151, maxRoll: 999, name: 'Insta-Kill', effect: 'Attack digs through foe\'s defenses to find a vital organ. Death is quick, bloody and painful.' },

    // --- SLASH CRITICAL INJURIES (Table 3-3) ---
    { type: 'Slash', severity: 1, minRoll: 1, maxRoll: 5, name: 'Just a Scratch', effect: 'Foe winces but carries on. Foe mutters a curse and suffers 1 additional wound.' },
    { type: 'Slash', severity: 1, minRoll: 6, maxRoll: 10, name: 'Caught Weapon', effect: 'At the start of their next turn, foe must perform a maneuver to regain their stance.' },
    { type: 'Slash', severity: 1, minRoll: 11, maxRoll: 15, name: 'Backhand Cut', effect: 'Foe can only use their off-hand on their next turn (+1 Setback to actions using off-hand).' },
    { type: 'Slash', severity: 1, minRoll: 16, maxRoll: 20, name: 'Weapon Flourish', effect: 'Foe recoils in fear and must perform the Guarded Stance maneuver on their next turn.' },
    { type: 'Slash', severity: 1, minRoll: 21, maxRoll: 25, name: 'Gut Wound', effect: 'Foe bends over opening themselves up for attack. Add 1 Advantage to the next attack vs. target.' },
    { type: 'Slash', severity: 1, minRoll: 26, maxRoll: 30, name: 'Blunt Strike', effect: 'Dull side of weapon hits foe\'s head. Target removes all Boost dice from their next skill check.' },
    { type: 'Slash', severity: 1, minRoll: 31, maxRoll: 35, name: 'Festering wound', effect: 'This Critical Injury\'s severity increases by 1 each week until healed (max 4).' },
    { type: 'Slash', severity: 1, minRoll: 36, maxRoll: 40, name: 'Damaged Tendons', effect: 'Increase the difficulty of the target\'s next check by one.' },
    
    { type: 'Slash', severity: 2, minRoll: 41, maxRoll: 45, name: 'Spinning Like a Top', effect: 'Target twirls around becoming Disoriented for their next 2 turns.' },
    { type: 'Slash', severity: 2, minRoll: 46, maxRoll: 50, name: 'Face Gash', effect: 'This will leave a scar. +1 Boost to all of foe\'s Social checks. -1 Setback to all Coercion checks.' },
    { type: 'Slash', severity: 2, minRoll: 51, maxRoll: 55, name: 'Severed Nerves', effect: 'The target must increase the difficulty of all Agility and Cunning checks by 1.' },
    { type: 'Slash', severity: 2, minRoll: 56, maxRoll: 60, name: 'Quick Swings', effect: 'Foe suffers 1 strain, and their Strain Threshold is reduced by 1 until critical healed.' },
    { type: 'Slash', severity: 2, minRoll: 61, maxRoll: 65, name: 'Slashed Muscles', effect: 'Target\'s Wound threshold is reduced by 1 until this Critical Injury is healed.' },
    { type: 'Slash', severity: 2, minRoll: 66, maxRoll: 70, name: 'Chopped Kneecap', effect: 'All of target\'s skills count as having one less rank to a minimum of zero.' },
    { type: 'Slash', severity: 2, minRoll: 71, maxRoll: 75, name: 'Hamstrung', effect: 'The target loses their free maneuver until this Critical Injury is healed.' },
    { type: 'Slash', severity: 2, minRoll: 76, maxRoll: 80, name: 'Broken Morale', effect: 'Any hostile action foe makes towards opponents causes them to suffer 3 strain.' },
    { type: 'Slash', severity: 2, minRoll: 81, maxRoll: 85, name: 'That\'s a Lot of Blood', effect: 'Target suffers 2 wounds and must upgrade the difficulty of all checks by 1 until the end of the encounter.' },
    { type: 'Slash', severity: 2, minRoll: 86, maxRoll: 90, name: 'Tormenting Anguish', effect: 'The target suffers 1 strain each time they receive one or more wounds.' },
    
    { type: 'Slash', severity: 3, minRoll: 91, maxRoll: 95, name: 'Open Gash', effect: 'The target suffers 1 wound each time they receive one or more wounds from any source.' },
    { type: 'Slash', severity: 3, minRoll: 96, maxRoll: 100, name: 'Crippled', effect: 'Target\'s limb (GM\'s choice) is impaired. Foe must add +1 Setback to all checks requiring that limb.' },
    { type: 'Slash', severity: 3, minRoll: 101, maxRoll: 105, name: 'Sliced and Diced', effect: 'Foe is Disoriented and can only act last each round until critical is healed.' },
    { type: 'Slash', severity: 3, minRoll: 106, maxRoll: 110, name: 'Severed Leg', effect: 'Foe loses a leg and suffers 4 strain. Until critical is healed foe adds +1 Setback to all checks.' },
    { type: 'Slash', severity: 3, minRoll: 111, maxRoll: 115, name: 'Damaged Spine', effect: 'Foe falls prone and cannot use move maneuvers. Foe must make an Average(2) Athletics check to crawl. Increase difficulty of all checks once.' },
    { type: 'Slash', severity: 3, minRoll: 116, maxRoll: 120, name: 'Traumatizing Injury', effect: 'Flesh rips to reveal bloody tissue. Foe must now make an incidental Hard(3) Fear check, and each time they start a combat encounter until this critical is healed.' },
    { type: 'Slash', severity: 3, minRoll: 121, maxRoll: 125, name: 'Severed Achilles Tendon', effect: 'Foe suffers 2 strain each time they make an action or a maneuver.' },
    { type: 'Slash', severity: 3, minRoll: 126, maxRoll: 130, name: 'Slashed Ligaments', effect: 'Target\'s Wound Threshold is reduced by 2, permanently.' },

    { type: 'Slash', severity: 4, minRoll: 131, maxRoll: 140, name: 'Bleeding Out', effect: 'Target suffers 1 wound and 1 strain at the start of their turns, and +1 Critical each 5 wounds above threshold.' },
    { type: 'Slash', severity: 4, minRoll: 141, maxRoll: 150, name: 'Deep Cut', effect: 'Foe is forced to use one hand as a worthless tourniquet. Unless critical is healed, foe bleeds to death at the end of next round.' },
    { type: 'Slash', severity: 4, minRoll: 151, maxRoll: 999, name: 'Decapitation', effect: 'Foe\'s head flies off while its body slowly crashes to the ground, dead.' },

    // --- COLD CRITICAL INJURIES (Table 2-2) ---
    { type: 'Cold', severity: 1, minRoll: 1, maxRoll: 5, name: 'Passing Chill', effect: 'A chill runs down foe\'s spine. Add 1 Advantage to the next attack vs. target.' },
    { type: 'Cold', severity: 1, minRoll: 6, maxRoll: 10, name: 'Slowed Down', effect: 'The target can only act during the last allied Initiative slot on their next turn.' },
    { type: 'Cold', severity: 1, minRoll: 11, maxRoll: 15, name: 'Hindered Reflexes', effect: 'Foe must spend two maneuvers to disengage from hostiles until end of encounter.' },
    { type: 'Cold', severity: 1, minRoll: 16, maxRoll: 20, name: 'Sluggish Reactions', effect: 'Target can only act last on each round until the end of the encounter.' },
    { type: 'Cold', severity: 1, minRoll: 21, maxRoll: 25, name: 'Slippery Gear', effect: 'Held item becomes cold and slippery. Until the end of target\'s next turn, add 2 Setback to all checks using that item.' },
    { type: 'Cold', severity: 1, minRoll: 26, maxRoll: 30, name: 'Temporary Freeze', effect: 'Foe is temporarily frozen and is Immobilized until the end of their next turn.' },
    { type: 'Cold', severity: 1, minRoll: 31, maxRoll: 35, name: 'Stunned', effect: 'The target is staggered until the end of their next turn.' },
    { type: 'Cold', severity: 1, minRoll: 36, maxRoll: 40, name: 'Chattering Teeth', effect: 'Target shakes uncontrollably and must add 1 Setback to their next check.' },

    { type: 'Cold', severity: 2, minRoll: 41, maxRoll: 45, name: 'Strong Gales', effect: 'Foe is Immobilized and Disoriented until the end of their next turn.' },
    { type: 'Cold', severity: 2, minRoll: 46, maxRoll: 50, name: 'Compromised Instincts', effect: 'The target must add 1 Boost to all Initiative checks until Critical Injury is healed.' },
    { type: 'Cold', severity: 2, minRoll: 51, maxRoll: 55, name: 'Head Cold', effect: 'All healing target receives do -1 wounds (to a minimum of 1) from all sources.' },
    { type: 'Cold', severity: 2, minRoll: 56, maxRoll: 60, name: 'Agonizing Wound', effect: 'Target must increase the difficulty of all Brawn and Agility checks by one.' },
    { type: 'Cold', severity: 2, minRoll: 61, maxRoll: 65, name: 'Impeding Winds', effect: 'Each time the target performs an action they suffer 1 strain (in addition to any cost).' },
    { type: 'Cold', severity: 2, minRoll: 66, maxRoll: 70, name: 'Freezing Cold', effect: 'Foe is Disoriented. If acquiring this Critical again, foe is Immobilized. A third time, Staggered. Fourth time, Incapacitated.' },
    { type: 'Cold', severity: 2, minRoll: 71, maxRoll: 75, name: 'Nose Freeze', effect: 'Foe loses nose to frostbite and must add +2 Setback to all Social checks until critical is healed.' },
    { type: 'Cold', severity: 2, minRoll: 76, maxRoll: 80, name: 'Overpowered', effect: 'Target is open and attacker may immediately attempt another attack (incidental), using the same exact dice pool.' },
    { type: 'Cold', severity: 2, minRoll: 81, maxRoll: 85, name: 'No Hope', effect: 'Until this critical is healed, the target must spend an additional Story Point to activate any effects, abilities and talents.' },
    { type: 'Cold', severity: 2, minRoll: 86, maxRoll: 90, name: 'Frigid Extremities', effect: 'Target can hardly move their fingers and adds 2 Setback to all physical checks.' },

    { type: 'Cold', severity: 3, minRoll: 91, maxRoll: 95, name: 'At the Brink', effect: 'The target suffers 2 strain each time they perform an action.' },
    { type: 'Cold', severity: 3, minRoll: 96, maxRoll: 100, name: 'Pulled Muscles', effect: 'All attacks vs. the target gain the Ensnare 1 quality until this critical is healed.' },
    { type: 'Cold', severity: 3, minRoll: 101, maxRoll: 105, name: 'Maimed', effect: 'Foe permanently loses a limb due to severe frostbite (GM\'s choice). All other actions gain +1 Setback until this Critical Injury is healed.' },
    { type: 'Cold', severity: 3, minRoll: 106, maxRoll: 110, name: 'Legs Frozen Solid', effect: 'Foe cannot perform move maneuvers or any actions requiring moving legs.' },
    { type: 'Cold', severity: 3, minRoll: 111, maxRoll: 115, name: 'Brain Freeze', effect: 'Target\'s Intellect and Cunning both are lowered by 1 until healed.' },
    { type: 'Cold', severity: 3, minRoll: 116, maxRoll: 120, name: 'Morbidly Sick', effect: 'Until this critical is healed, the foe cannot recover strain, except by magical or technological healing (GM\'s call).' },
    { type: 'Cold', severity: 3, minRoll: 121, maxRoll: 125, name: 'Frostbite', effect: 'In the future, whenever foe suffers a Critical Injury, they suffer an additional Critical Injury.' },
    { type: 'Cold', severity: 3, minRoll: 126, maxRoll: 130, name: 'Chilled Heart', effect: 'The target\'s Strain Threshold is reduced by 1, permanently.' },

    { type: 'Cold', severity: 4, minRoll: 131, maxRoll: 140, name: 'Hypothermia', effect: 'Target suffers 2 strain at the start of their turn, and +1 Critical Injury per 5 strain above threshold.' },
    { type: 'Cold', severity: 4, minRoll: 141, maxRoll: 150, name: 'Absolute Zero', effect: 'Ice spread over foe, rapidly lowering their body temperature. Target freezes to death at the end of next round.' },
    { type: 'Cold', severity: 4, minRoll: 151, maxRoll: 999, name: 'Ice Statue', effect: 'Foe turns into ice. A nudge (incidental) will tip foe over and shatter them into a million pieces.' },

    // --- ELECTRICITY CRITICAL INJURIES (Table 2-2) ---
    { type: 'Electricity', severity: 1, minRoll: 1, maxRoll: 5, name: 'Static Electricity', effect: 'Target\'s hair rise up. Add 1 Advantage to target\'s next check.' },
    { type: 'Electricity', severity: 1, minRoll: 6, maxRoll: 10, name: 'Pop!', effect: 'With a pop, the attack knocks target back and sends them one move maneuver away from attacker.' },
    { type: 'Electricity', severity: 1, minRoll: 11, maxRoll: 15, name: 'Sudden Jolt', effect: 'The target drops whatever is in hand.' },
    { type: 'Electricity', severity: 1, minRoll: 16, maxRoll: 20, name: 'Distracted', effect: 'The target cannot perform a free maneuver during their next turn.' },
    { type: 'Electricity', severity: 1, minRoll: 21, maxRoll: 25, name: 'Dazzling Lights', effect: 'Foe is dazzled. Until end of next turn, target cannot see beyond Engaged range and can only perform actions on engaged targets.' },
    { type: 'Electricity', severity: 1, minRoll: 26, maxRoll: 30, name: 'Discouraging Wound', effect: 'Move one Story Point from the target\'s pool to the attacker\'s pool.' },
    { type: 'Electricity', severity: 1, minRoll: 31, maxRoll: 35, name: 'Super-conductor', effect: 'Attack jumps to additional hostiles engaged with the target. Target and all affected immediately suffer 1 wound.' },
    { type: 'Electricity', severity: 1, minRoll: 36, maxRoll: 40, name: 'Flesh Fuses with Protective Gear', effect: 'Foe\'s Wound Threshold is reduced by 2 until end of encounter.' },
    
    { type: 'Electricity', severity: 2, minRoll: 41, maxRoll: 45, name: 'Violent Shakes', effect: 'Target twitches profusely and must upgrade the difficulty of their next check once.' },
    { type: 'Electricity', severity: 2, minRoll: 46, maxRoll: 50, name: 'Fried Nerves', effect: 'Target must add 1 Setback to all Brawn and Agility checks until the end of the encounter.' },
    { type: 'Electricity', severity: 2, minRoll: 51, maxRoll: 55, name: 'Weakened Muscles', effect: 'Target inflicts -2 damage with Melee and Ranged attacks (1 minimum).' },
    { type: 'Electricity', severity: 2, minRoll: 56, maxRoll: 60, name: 'Electroshock', effect: 'Whenever the foe recovers strain, they recover -2 strain (to a minimum of 1) from all sources, until the end of the encounter.' },
    { type: 'Electricity', severity: 2, minRoll: 61, maxRoll: 65, name: 'Slightly Dazed', effect: 'The target is Disoriented until this Critical Injury is healed.' },
    { type: 'Electricity', severity: 2, minRoll: 66, maxRoll: 70, name: 'Burning Nerves', effect: 'The target suffers 1 strain each time they perform a maneuver (in addition to any cost).' },
    { type: 'Electricity', severity: 2, minRoll: 71, maxRoll: 75, name: 'Twitches', effect: 'Foe must make an Average(2) Athletics/Coordination check to move or fall prone.' },
    { type: 'Electricity', severity: 2, minRoll: 76, maxRoll: 80, name: 'Chain Lightning', effect: 'The attack jumps to another target up to short range. Attacker may select a new (or same) target and attack (incidental) using same pool.' },
    { type: 'Electricity', severity: 2, minRoll: 81, maxRoll: 85, name: 'Feedback', effect: 'Foe must upgrade the difficulty of casting spells/psychic powers/setting equivalent checks, and suffers 1 strain on all non-physical checks.' },
    { type: 'Electricity', severity: 2, minRoll: 86, maxRoll: 90, name: 'Blinding Flashes', effect: 'Foe is Disoriented and cannot see beyond short range until critical is healed.' },

    { type: 'Electricity', severity: 3, minRoll: 91, maxRoll: 95, name: 'Major Nerve Damage', effect: 'Target must double the amount of setback dice on all rolls.' },
    { type: 'Electricity', severity: 3, minRoll: 96, maxRoll: 100, name: 'Random Item Fuses with Flesh', effect: 'Upgrade difficulty of all checks using item once. Armor gear loses 1 Soak. This item cannot be detached until critical is healed.' },
    { type: 'Electricity', severity: 3, minRoll: 101, maxRoll: 105, name: 'Locked Jaw', effect: 'Target cannot open their mouth. Upgrade the difficulty of foe\'s social checks twice. Foe can only consume liquids.' },
    { type: 'Electricity', severity: 3, minRoll: 106, maxRoll: 110, name: 'Ringing Ears', effect: 'Loud boom deafens foe. Foe upgrades the difficulty of all checks benefited by hearing once.' },
    { type: 'Electricity', severity: 3, minRoll: 111, maxRoll: 115, name: 'Electrocution', effect: 'The target\'s Brawn and Agility characteristics both are lowered by 1 until healed.' },
    { type: 'Electricity', severity: 3, minRoll: 116, maxRoll: 120, name: 'Magnetically Charged', effect: 'On their turn in a structured encounter (or once in non-structured), foe is attacked by a flying metal object (Ranged 2, Dmg:3; CR:3).' },
    { type: 'Electricity', severity: 3, minRoll: 121, maxRoll: 125, name: 'Lobotomized', effect: 'Foe\'s Intellect, Cunning and Presence characteristics are lowered to 1 until critical is healed.' },
    { type: 'Electricity', severity: 3, minRoll: 126, maxRoll: 130, name: 'Compromised Skeletal Integrity', effect: 'All attacks vs. target gain Vicious 1 Quality, permanently.' },

    { type: 'Electricity', severity: 4, minRoll: 131, maxRoll: 140, name: 'Nervous system acts as super-conductor', effect: 'Foe suffers 2 wounds and 1 strain at the start of their turn. Anyone touching target also suffers 1 wound.' },
    { type: 'Electricity', severity: 4, minRoll: 141, maxRoll: 150, name: 'Light Show', effect: 'Foe lights up in a magnificent show of flashes and sparks as lightning rushes through their body. Only a burnt smoking carcass remains.' },
    { type: 'Electricity', severity: 4, minRoll: 151, maxRoll: 999, name: 'Vaporized', effect: 'Target is completely vaporized into a cloud of red mist. Little forensic evidence remains.' },

    // --- HEAT CRITICAL INJURIES (Table 2-2) ---
    { type: 'Heat', severity: 1, minRoll: 1, maxRoll: 5, name: 'Momentary Burn', effect: 'Target suffers either 1 wound or 1 strain (their choice).' },
    { type: 'Heat', severity: 1, minRoll: 6, maxRoll: 10, name: 'Heat Wave', effect: 'Foe sweats profusely and may perform only one maneuver on their next turn.' },
    { type: 'Heat', severity: 1, minRoll: 11, maxRoll: 15, name: 'Scorched Back', effect: 'Target\'s backpack, cloak or one random clothing item is ruined.' },
    { type: 'Heat', severity: 1, minRoll: 16, maxRoll: 20, name: 'Sleeve on Fire', effect: 'At start of their next turn, foe must spend a maneuver to put out flames or suffer 2 wounds.' },
    { type: 'Heat', severity: 1, minRoll: 21, maxRoll: 25, name: 'Completely Exhausted', effect: 'When the target recovers strain at the end of this encounter only, they recover -2 strain (to a minimum of 1).' },
    { type: 'Heat', severity: 1, minRoll: 26, maxRoll: 30, name: 'Boiling Point', effect: 'Attacks vs. target gain Burn 1 quality until the end of the attacker\'s next turn.' },
    { type: 'Heat', severity: 1, minRoll: 31, maxRoll: 35, name: 'Heated Item', effect: 'Held item burns target\'s hand. Target must wait until the end of next round before using that hand and weapon cools so it can be picked up.' },
    { type: 'Heat', severity: 1, minRoll: 36, maxRoll: 40, name: 'Too Hot to Concentrate', effect: 'Foe must add 1 Setback to all Intellect and Cunning checks until end of encounter.' },
    
    { type: 'Heat', severity: 2, minRoll: 41, maxRoll: 45, name: 'Fire!', effect: 'Foe suffers 1 wound on their turn until they put fire out per normal rules (CRB p.111-112).' },
    { type: 'Heat', severity: 2, minRoll: 46, maxRoll: 50, name: 'Scorching Heat', effect: 'Each time target makes an Intellect or Cunning check they suffer 1 strain.' },
    { type: 'Heat', severity: 2, minRoll: 51, maxRoll: 55, name: 'Fearsome Wound', effect: 'Foe must increase the difficulty of all Presence and Willpower checks by 1.' },
    { type: 'Heat', severity: 2, minRoll: 56, maxRoll: 60, name: 'Unbearable Heat', effect: 'Whenever target suffers strain, they suffer 1 additional strain.' },
    { type: 'Heat', severity: 2, minRoll: 61, maxRoll: 65, name: 'Easily Flammable', effect: 'Until this critical is healed, all attacks vs. the target gain the Burn 1 quality.' },
    { type: 'Heat', severity: 2, minRoll: 66, maxRoll: 70, name: 'Scattered Senses', effect: 'The target removes all Boost dice from skill checks until this Critical Injury is healed.' },
    { type: 'Heat', severity: 2, minRoll: 71, maxRoll: 75, name: 'Searing Pain', effect: 'When the target suffers a Critical Injury, they suffer 1 wound and 1 strain.' },
    { type: 'Heat', severity: 2, minRoll: 76, maxRoll: 80, name: 'Spreading Flames', effect: 'Fire rapidly spreads across target\'s body. Target immediately suffers an additional Critical Injury with -20 to the roll.' },
    { type: 'Heat', severity: 2, minRoll: 81, maxRoll: 85, name: 'Skin Boiling', effect: 'Target must add 2 Setback to all skill checks until this critical is healed.' },
    { type: 'Heat', severity: 2, minRoll: 86, maxRoll: 90, name: 'Compromised', effect: 'Increase difficulty of all skill checks by one until this Critical Injury is healed.' },

    { type: 'Heat', severity: 3, minRoll: 91, maxRoll: 95, name: 'Desiccated', effect: 'Until end of encounter, foe cannot regain strain except from magical/technological healing (GM\'s call).' },
    { type: 'Heat', severity: 3, minRoll: 96, maxRoll: 100, name: 'Third Degree Burns', effect: 'Target\'s Wound Threshold is reduced by 2 until this Critical Injury is healed.' },
    { type: 'Heat', severity: 3, minRoll: 101, maxRoll: 105, name: 'Open Up Wounds', effect: 'The Severity Rating of every Critical Injury currently affecting target increases by 1 (max 4), not including this one.' },
    { type: 'Heat', severity: 3, minRoll: 106, maxRoll: 110, name: 'Horrific Injury', effect: 'Until Critical Injury is healed, target lowers one characteristic by 1.' },
    { type: 'Heat', severity: 3, minRoll: 111, maxRoll: 115, name: 'Torso Ablaze', effect: 'Foe suffers 4 wounds at start of their turn until they put fire out (CRB p.111-112).' },
    { type: 'Heat', severity: 3, minRoll: 116, maxRoll: 120, name: 'Blinded', effect: 'The target can no longer see. Upgrade the difficulty of all checks x2, and upgrade the difficulty of Perception and Vigilance checks x3.' },
    { type: 'Heat', severity: 3, minRoll: 121, maxRoll: 125, name: 'Hands in Flames', effect: 'Foe cannot use their hands until this critical is healed.' },
    { type: 'Heat', severity: 3, minRoll: 126, maxRoll: 130, name: 'Face Burn', effect: 'Foe is left with garish scars. +1 Setback to all of foe\'s Social checks, permanently.' },

    { type: 'Heat', severity: 4, minRoll: 131, maxRoll: 140, name: 'Lava Lungs', effect: 'Foe inhales a deadly amount of scorching fumes. Reduce foe\'s Brawn and Agility scores to 1 until this critical is healed.' },
    { type: 'Heat', severity: 4, minRoll: 141, maxRoll: 150, name: 'Engulfed in Flames', effect: 'Unless miraculously treated, foe dies at the end of next round, flesh burning and blood boiling.' },
    { type: 'Heat', severity: 4, minRoll: 151, maxRoll: 999, name: 'Spontaneous Combustion', effect: 'Nothing is left of foe but for a pile of warm, stinking ashes.' }
  ];

  for (const inj of injuries) {
    const existing = await prisma.globalCriticalInjury.findFirst({
      where: { name: inj.name, type: inj.type }
    });
    if (!existing) {
      await prisma.globalCriticalInjury.create({ data: inj });
    } else {
      await prisma.globalCriticalInjury.update({
        where: { id: existing.id },
        data: inj
      });
    }
  }

  console.log('Seeded Global Critical Injuries!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
