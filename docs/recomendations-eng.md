## Event Creation Guidelines

### 1. General Principles
1. **All events should be divided into 4 categories:**
	1. **News** – Events that notify the world about important occurrences.
	2. **Mechanics** – Events that add variety to gameplay without interacting with other countries. For example: extra events triggered by high unrest, "trading," etc.
	3. **Core Event Branches** – Their start must be initiated by player actions, rather than an event arriving at a specific time.
	4. **Bot Triggers** – These trigger actions necessary to launch event branches, mimicking the actions players can take.
2. **The script should not lead the player; it should adapt to them**, firing events at the appropriate time. The problem with current "classic" scripted events is that the player is constantly waiting—for an event branch to start or for the next event to pop up. The player should not wait; they should trigger events through their own actions.
	1. For the player, it should feel like a standard game on a scenario without events, but the scenario must provide feedback.
3. To make the world feel alive yet not chaotic, it is important to create **events that fire only for bots** to initiate their actions: starting wars, forming alliances, imposing sanctions, etc.
4. To help the player understand the global situation and where the "action" is, **news events** must be created. these carry no functional weight and simply inform the player about what is happening.
5. **Event titles should be short**, no more than 4 words—ideally 2 or 3.

---

### 2. News Events
1. It is recommended to use **exclusively the standard event icon** for most news, and the icon with **id=losses** for war news to avoid confusion.
2. It is recommended to set the **expiration timer to two turns** instead of one. This allows a player to read the news on the next turn if they accidentally skip one, without cluttering the event list during long time-skips.
3. The **title or the first words of the text** should indicate all involved countries and the subject of the news, followed by the flavor description.
4. News events should primarily trigger based on **in-game actions** (existing alliance/war, etc.) rather than event-driven actions. Events cause actions, but players can perform those same actions themselves.
5. **News events should be sent to everyone**, including the initiator countries.
	1. In multiplayer, this keeps players immersed in the context of what others are discussing. In single-player, it provides a sense of certainty that the scenario is functioning correctly because the game provides a proper response.

---

### 3. Bot Triggers
1. **Bot triggers should only function when there are fewer than 5 players.**
	1. This ensures that in multiplayer games, players interact primarily with each other rather than getting bogged down in conflicts with bots.
	2. Use the same player-count threshold everywhere to allow for quick global adjustments.
2. Bot trigger events should include **maximum protection against false triggers**.
3. To reduce chaos, it is recommended to fire an event on the **first turn** that grants a bonus which **disables bot diplomacy**.
	1. The condition should not be "turn == 1", but rather "received != thisEvent". This ensures diplomacy is disabled not only for starting nations but also for newly created ones (via rebellions or events).

---

### 4. Core Event Branches
1. **Separate bonuses** if they cause imbalance.
	1. There are many situations where, for fun or added challenge, you might give specific buffs/debuffs or create a "scripted world." However, this works poorly in multiplayer. In such cases, move bonuses to separate events that activate based on the player count.
	2. If the player count is low (**less than 6**), the full version activates.
	3. If the player count is high (**more than 5**), a version with limited bonuses activates, or it doesn't activate at all.
2. The activation conditions for the **first event in a chain** must be strictly defined and occur upon specific player or bot actions.
3. Subsequent events in the chain can have fewer conditions to speed up scenario creation. They can be based on their place in the sequence, using conditions like "event received," "event cooldown," or "event choice."
4. **Significant buffs and debuffs** should be granted for a short duration only.
5. Anticipate players **breaking the event chain**, for example, by signing an early peace treaty through in-game mechanics.
	1. In such cases, you must either terminate the event chain, skip part of it, or trigger an alternative chain if one exists.
6. It is recommended to **notify the player** if there are no events currently related to their country.
7. It is recommended to **warn the player of serious consequences** resulting from their actions or the actions of neighboring countries. For example: notifying the puppet government of the temporarily occupied territories of South Korea and Japan about the destruction of their economy by "Korean artillery, rockets, and nuclear weapons" in the event of a war with them.
