# EEditor and Event System Documentation

## EEditor

EEditor is a powerful tool for creating and editing scenarios in the game. It allows you to:
- Create and edit countries
- Manage events and event chains
- Configure reforms
- Edit diplomatic relations
- Create complex game scenarios

### Main Features

1. **Country Management**
   - Creating new countries
   - Editing existing countries
   - Setting up relations between countries
   - Managing territories and provinces
   - Configuring political systems

2. **Event System**
   - Creating single events
   - Building event chains
   - Setting up trigger conditions
   - Creating complex scenarios
   - Managing event effects

3. **Reforms**
   - Creating country reforms
   - Setting up implementation conditions
   - Managing reform effects
   - Creating reform chains

## Event System

### Event Structure

Each event consists of the following elements:

1. **Basic Parameters**
   - Event ID
   - Event group
   - System name
   - Title
   - Description
   - Event image
   - Event icon

2. **Display Settings**
   - Hide later
   - Delete after X turns
   - Auto-select when ignored

3. **Response Options (up to 3)**
   Each response includes:
   - Response text
   - Result description
   - Availability conditions
   - Effects when chosen
   - Auto-select when ignored

### Event Conditions

Events can have various trigger conditions:

1. **Time Conditions**
   - Specific turn
   - Year
   - Month
   - Time range

2. **Country Conditions**
   - Political system
   - Number of provinces
   - Presence of specific territories
   - Economic indicators
   - Military power

3. **Diplomatic Conditions**
   - Presence of wars
   - Alliances
   - Pacts
   - Sanctions
   - Independence guarantees

4. **Economic Conditions**
   - Economic level
   - Resource availability
   - Trade relations
   - Development level

### Event Effects

Events can trigger various effects:

1. **Country Changes**
   - Changing country parameters
   - Gaining/losing territories
   - Changing political system
   - Economic changes

2. **Diplomatic Effects**
   - Declaring war
   - Making peace
   - Creating alliances
   - Imposing sanctions
   - Changing relations

3. **Military Effects**
   - Gaining/losing troops
   - Changing military power
   - Receiving military equipment
   - Army losses

4. **Economic Effects**
   - Resource changes
   - Economic indicator changes
   - Trade impact
   - Income changes

### Event Chains

The system allows creating linked event chains:

1. **Chain Structure**
   - Sequential events
   - Branching scenarios
   - Conditional transitions
   - Time delays

2. **Transition Conditions**
   - By response choice
   - By time
   - By condition fulfillment
   - By country state

3. **Chain Management**
   - Creating development branches
   - Setting up transition conditions
   - Managing trigger timing
   - Linking events

### Best Practices

1. **Creating Events**
   - Use clear IDs and names
   - Group related events
   - Write clear descriptions
   - Check all conditions

2. **Effect Balance**
   - Maintain balance of positive and negative effects
   - Consider impact on gameplay
   - Check interaction with other events
   - Test various scenarios

3. **Event Chains**
   - Plan structure in advance
   - Check all development branches
   - Test different paths
   - Consider time frames

4. **Debugging**
   - Check trigger conditions
   - Test all response options
   - Verify effects
   - Monitor game impact 