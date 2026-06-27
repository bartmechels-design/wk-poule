import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { WK_TEAMS } from "@/lib/wk-data";

const ROUND_OF_32_PAIRINGS = [
  { match: 1, group1: "A", pos1: 1, group2: "B", pos2: 2 },
  { match: 2, group1: "A", pos1: 2, group2: "B", pos2: 1 },
  { match: 3, group1: "C", pos1: 1, group2: "D", pos2: 2 },
  { match: 4, group1: "C", pos1: 2, group2: "D", pos2: 1 },
  { match: 5, group1: "E", pos1: 1, group2: "F", pos2: 2 },
  { match: 6, group1: "E", pos1: 2, group2: "F", pos2: 1 },
  { match: 7, group1: "G", pos1: 1, group2: "H", pos2: 2 },
  { match: 8, group1: "G", pos1: 2, group2: "H", pos2: 1 },
  { match: 9, group1: "I", pos1: 1, group2: "J", pos2: 2 },
  { match: 10, group1: "I", pos1: 2, group2: "J", pos2: 1 },
  { match: 11, group1: "K", pos1: 1, group2: "L", pos2: 2 },
  { match: 12, group1: "K", pos1: 2, group2: "L", pos2: 1 },
];

type GroupStats = { team: string; pts: number; gd: number; gf: number };

async function getGroupStandings(): Promise<Record<string, GroupStats[]>> {
  const groups: Record<string, string[]> = {};
  const standings: Record<string, Record<string, GroupStats>> = {};

  WK_TEAMS.forEach((team) => {
    if (!groups[team.group]) groups[team.group] = [];
    groups[team.group].push(team.name);
  });

  for (const [groupKey, teams] of Object.entries(groups)) {
    if (!standings[groupKey]) standings[groupKey] = {};

    for (const team of teams) {
      const [homeMatches, awayMatches] = await Promise.all([
        db.match.findMany({
          where: { stage: "GROUP", homeTeam: team },
          select: { homeScore: true, awayScore: true },
        }),
        db.match.findMany({
          where: { stage: "GROUP", awayTeam: team },
          select: { homeScore: true, awayScore: true },
        }),
      ]);

      let pts = 0, gf = 0, ga = 0;

      homeMatches.forEach((m) => {
        if (m.homeScore === null || m.awayScore === null) return;
        gf += m.homeScore;
        ga += m.awayScore;
        if (m.homeScore > m.awayScore) pts += 3;
        else if (m.homeScore === m.awayScore) pts += 1;
      });

      awayMatches.forEach((m) => {
        if (m.homeScore === null || m.awayScore === null) return;
        gf += m.awayScore;
        ga += m.homeScore;
        if (m.awayScore > m.homeScore) pts += 3;
        else if (m.homeScore === m.awayScore) pts += 1;
      });

      standings[groupKey][team] = { team, pts, gd: gf - ga, gf };
    }
  }

  const sorted: Record<string, GroupStats[]> = {};
  for (const [group, teamStats] of Object.entries(standings)) {
    sorted[group] = Object.values(teamStats).sort(
      (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
    );
  }

  return sorted;
}

async function isGroupComplete(groupTeams: string[]): Promise<boolean> {
  for (const team of groupTeams) {
    const totalMatches = await db.match.count({
      where: { stage: "GROUP", OR: [{ homeTeam: team }, { awayTeam: team }] },
    });
    if (totalMatches < 3) return false;
  }
  return true;
}

async function generateRound32Matches() {
  const standings = await getGroupStandings();
  const groups: Record<string, string[]> = {};
  const matches: any[] = [];
  const qualified: Set<string> = new Set();

  WK_TEAMS.forEach((team) => {
    if (!groups[team.group]) groups[team.group] = [];
    groups[team.group].push(team.name);
  });

  // Top 2 van elke groep (ALLEEN als groep compleet is)
  for (const pairing of ROUND_OF_32_PAIRINGS) {
    const isGroup1Complete = await isGroupComplete(groups[pairing.group1]);
    const isGroup2Complete = await isGroupComplete(groups[pairing.group2]);

    const team1 = isGroup1Complete ? standings[pairing.group1]?.[pairing.pos1 - 1]?.team : null;
    const team2 = isGroup2Complete ? standings[pairing.group2]?.[pairing.pos2 - 1]?.team : null;

    if (team1) qualified.add(team1);
    if (team2) qualified.add(team2);

    matches.push({
      matchId: `ro32_${pairing.match}`,
      homeTeam: team1 || null,
      awayTeam: team2 || null,
      matchNumber: pairing.match,
      stage: "ROUND_OF_32",
    });
  }

  // Top 4 van 3de plaats (alleen als alle groepen compleet zijn)
  const allGroupsComplete = await Promise.all(
    Object.values(groups).map(g => isGroupComplete(g))
  ).then(arr => arr.every(v => v));

  if (allGroupsComplete) {
    const thirdPlacedTeams = Object.entries(standings)
      .map(([group, stats]) => ({ group, team: stats[2], position: 3 }))
      .filter((x) => x.team)
      .sort((a, b) => b.team.pts - a.team.pts || b.team.gd - a.team.gd)
      .slice(0, 4);

    for (let i = 0; i < thirdPlacedTeams.length; i += 2) {
      const team1 = thirdPlacedTeams[i]?.team?.team;
      const team2 = thirdPlacedTeams[i + 1]?.team?.team;

      if (team1) qualified.add(team1);
      if (team2) qualified.add(team2);

      matches.push({
        matchId: `ro32_${13 + i / 2}`,
        homeTeam: team1 || null,
        awayTeam: team2 || null,
        matchNumber: 13 + Math.floor(i / 2),
        stage: "ROUND_OF_32",
      });
    }
  } else {
    for (let i = 0; i < 4; i++) {
      matches.push({
        matchId: `ro32_${13 + i}`,
        homeTeam: null,
        awayTeam: null,
        matchNumber: 13 + i,
        stage: "ROUND_OF_32",
      });
    }
  }

  return { matches, qualified };
}

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  try {
    const { matches: ro32Matches, qualified } = await generateRound32Matches();
    let created = 0, updated = 0;

    for (const match of ro32Matches) {
      const existing = await db.match.findFirst({
        where: { stage: "ROUND_OF_32", round: `match_${match.matchNumber}` },
      });

      if (existing) {
        await db.match.update({
          where: { id: existing.id },
          data: {
            homeTeam: match.homeTeam || existing.homeTeam,
            awayTeam: match.awayTeam || existing.awayTeam,
            homeFlag: match.homeTeam ? getTeamFlag(match.homeTeam) : existing.homeFlag,
            awayFlag: match.awayTeam ? getTeamFlag(match.awayTeam) : existing.awayFlag,
          },
        });
        updated++;
      } else if (match.homeTeam && match.awayTeam) {
        await db.match.create({
          data: {
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            homeFlag: getTeamFlag(match.homeTeam),
            awayFlag: getTeamFlag(match.awayTeam),
            stage: "ROUND_OF_32",
            round: `match_${match.matchNumber}`,
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "SCHEDULED",
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      message: `RO32 bijgewerkt: ${created} nieuw, ${updated} aangepast`,
      created,
      updated,
      qualifiedTeams: Array.from(qualified),
    });
  } catch (err: unknown) {
    const bericht = err instanceof Error ? err.message : "Onbekende fout";
    return NextResponse.json({ error: bericht }, { status: 500 });
  }
}

function getTeamFlag(teamName: string): string {
  return WK_TEAMS.find((t) => t.name === teamName)?.flag || "🏳️";
}
