# VBFH Current Knowledge Audit — 2026-09-21

Purpose: verified delta for the voice assistant. This file does not change the production tenant by itself.

## Official-source facts verified 2026-09-21

### Facility hours
- Facility hours: Monday–Friday 1:00 PM–11:00 PM; Saturday–Sunday 9:00 AM–8:00 PM.
- Fall/Winter customer service hours: Monday–Friday 1:00 PM–10:30 PM; Saturday 9:00 AM–varies; Sunday 9:00 AM–8:00 PM.
- Source: https://beachfieldhouse.com/location/

### Adult Flag Football
- Fall season: September 4–October 23, 2026.
- Registration opened July 26.
- Registration fee: $119/player.
- Program contact: Mike Fisher, mfisher@beachfieldhouse.com / leaguedirector@beachfieldhouse.com.
- Source: https://beachfieldhouse.com/activity/adult-flag-football/

### Adult Basketball
- Fall season: September 4–October 23, 2026.
- Registration opened July 26.
- Registration fee: $85/player.
- Program contact: Frankie Cabrera, basketball@beachfieldhouse.com.
- Source: https://beachfieldhouse.com/activity/adult-basketball/

### Youth Volleyball
- Fall season: September 13–October 25, 2026.
- Registration opened July 26 and closed August 30.
- Registration fee: $84/player.
- Program contact listed as Celyna Kemp, ckemp@beachfieldhouse.com.
- Source: https://beachfieldhouse.com/activity/youth-volleyball/

### Skills Institute
- Fall season: September 8–November 15, 2026.
- Registration opened August 3.
- Classes run Monday–Sunday.
- Fee: $19.50/class.
- Source: https://beachfieldhouse.com/activity/skills-institute/

### Lil' Ballers
- Fall season: September 11–November 13, 2026.
- Registration opened August 3.
- Classes: Fridays.
- Fee: $18.50/class.
- Source: https://beachfieldhouse.com/activity/lil-ballers/

### Rentals
- Large indoor turf: $140/hour off-peak, $180/hour peak.
- Small carpet turf: $65/hour off-peak, $80/hour peak.
- Basketball court: $65/hour off-peak, $90/hour peak.
- Volleyball court: $35/hour off-peak, $45/hour peak.
- Sand volleyball court: $25/hour.
- Room without host: $65/hour.
- Peak: Monday–Friday after 5 PM; weekends all day.
- Source: https://beachfieldhouse.com/rentals/

## Required production changes before the VBFH voice demo

1. Remove Summer II 2026 as 'current' season information.
2. Replace the old hours with the current official facility/customer-service hours above.
3. Add Fall 2026 league/class facts only where verified from official pages.
4. Add explicit per-fact verification dates and freshness/expiry rules.
5. Keep live schedules, scores, standings, field assignments and account/check-in status as unavailable unless a live verified source is connected.
6. Re-run the no-hallucination test suite after the tenant knowledge is updated.

## Suggested freshness

- Facility address/phone: verify every 90 days.
- Facility/customer-service hours: verify every 14 days.
- Active seasons/fees/program contacts: verify every 7 days during an active season.
- Live schedules/scores/standings: never cache as general knowledge; retrieve live or route caller to official source.
- Holiday/special-event hours: treat as live/volatile and do not promise without verification.