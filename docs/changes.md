# Changes Tracker

This tracker was reset after completing the current milestone handoff on 2026-04-08.

Use this file for the next cycle of implementation work.

## Open items

- ~~there shoudlnt be a team selector on the left sidebar~~

- ~~after we simulate the match the dashboard shoulld show the result of the match and the rest of the round outcomes in a diffrent pop up~~

- ~~add a staff part to this, staff should have a role and a personality, they should also have a happiness level, if the happiness level is too low they should leave the club, we should also be able to sack them and hire new ones in a similar way to players they have contracts and stuff and attributes. They can grow and decline in attributes and happiness over time. They also take up a wage budget. Which is seperate from our wage budget. but still are reflected in the club finances.~~

- ~~Add a youth team, youth team players are generated at the start of the game and are around 15-17 years old. They can be promoted to the first team and can be sold. They also take up a wage budget. This is something that is generated at random when we start the seed, all teams have an academy and the talent in their is random. This also has staff associated to it.~~ 

- ~~Add the 20 teams to the game, they should be generated at random when we start the seed, they should have a name, a stadium, a wage budget, a transfer budget, a youth budget, a reputation, this would be the first division, we should also have a second division with 20 teams, and a third division with 20 teams.~~ 

- ~~Add a league table for each division, the league table should show the teams in the division, their position, points, goal difference, goals for, goals against, and the number of games played.~~ 

- ~~1. 📱 Social Media Economy (your idea → expand it)~~

Core idea: Clubs build a digital presence → generates revenue + affects players

Mechanics:

Followers, engagement %, virality
Revenue streams:
Ads
Sponsorship posts
Merch boosts
Events:
Viral moment (match highlight → spike)
PR disaster (drop revenue)

System fit:

New table: club_media_profiles
Hook into:
match results → content spikes
player personalities → engagement

👉 This adds a modern FM layer that most games don’t have.

~~2. 🧠 Staff System with Risk/Variance (your idea → deepen it)~~

Core idea: Staff are not just “+X% buffs” — they’re probabilistic

Types:

Financial Director → better deals / risk control
Marketing Head → boosts social revenue
Scout → impacts transfer ROI
Youth Director → long-term value

Twist (your idea):

“High potential” staff = volatile outcomes
“Veteran” staff = stable but capped upside

Example:

Cheap marketing hire → 10% chance of viral growth, 40% chance of no impact
~~3. 📊 Dynamic Sponsorship Deals~~

Instead of static sponsors → negotiation system

Variables:

Club reputation
League position
Social media presence (ties to #1)

Deal types:

Safe: fixed income
Performance-based: win bonuses
Risky: huge upside, penalties if you fail

System hook:

Add contracts + negotiation flow (fits your transfer system patterns)
4. 🎟️ Stadium & Matchday Revenue Depth

Right now this is probably too simple.

Add:

Ticket pricing strategy
Attendance elasticity (price vs demand)
Fan satisfaction → affects turnout

Upgrades:

VIP sections
Food revenue
Stadium expansion loans
~~5. 🏦 Debt, Loans & Cash Flow Pressure~~

Make finances feel real.

Mechanics:

Take loans → interest over time
Miss payments → penalties
Cash flow vs profit (important distinction)

Gameplay tension:

“Do I go all-in this season?”
6. 📉 Financial Fair Play / Board Pressure

Adds constraints + realism.

Systems:

Wage-to-revenue ratio
Transfer spending limits
Board confidence tied to finances

You already hinted at “board endpoints” in your API gaps

7. 🧒 Youth Investment Pipeline

Long-term ROI system.

Invest in:

Academy quality
Facilities
Coaching

Outcome:

Generates cheap talent → huge financial upside
~~8. 🧠 Player Market Value Engine (CRITICAL)~~

This is one of the biggest missing pieces.

Right now:

You mention needing player value endpoints

Value should depend on:

Form
Age curve
Performance (goals, ratings)
Hype (social media tie-in)

Result:

You can flip players → actual strategy
~~9. 🎯 Scouting Uncertainty → Financial Risk~~

Tie finances to information asymmetry.

Mechanic:

Unknown players = estimated value range
Bad scouting = overpay risk

Example:

Player shown as $5–10M
Real value = $3M → you get fleeced
~~10. 📈 Multi-Stream Revenue System (not just “budget”)~~

Break revenue into categories:

Matchday
Broadcasting
Sponsorship
Merch
Social (new)
Transfers

Then:

Each has its own drivers
Each reacts to different systems

This aligns with your “finance mechanic history” already tracked


## Notes

- Previous implementation checklist has been completed and cleared.
