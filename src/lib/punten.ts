export type Breakdown = {
  winnaar: number;
  exact: number;
  thuisDoelpunten: number;
  uitDoelpunten: number;
};

export function berekenPunten(
  predictedHome: number,
  predictedAway: number,
  predictedWinner: string,
  actualHome: number,
  actualAway: number
): { total: number; breakdown: Breakdown } {
  const actualWinner =
    actualHome > actualAway ? "HOME" : actualHome < actualAway ? "AWAY" : "DRAW";

  const breakdown: Breakdown = {
    winnaar: 0,
    exact: 0,
    thuisDoelpunten: 0,
    uitDoelpunten: 0,
  };

  if (predictedWinner === actualWinner) breakdown.winnaar = 2;
  if (predictedHome === actualHome && predictedAway === actualAway) breakdown.exact = 5;
  if (predictedHome === actualHome) breakdown.thuisDoelpunten = 1;
  if (predictedAway === actualAway) breakdown.uitDoelpunten = 1;

  const total =
    breakdown.winnaar +
    breakdown.exact +
    breakdown.thuisDoelpunten +
    breakdown.uitDoelpunten;

  return { total, breakdown };
}

export function winnaarLabel(winner: string): string {
  if (winner === "HOME") return "thuisploeg wint";
  if (winner === "AWAY") return "uitploeg wint";
  return "gelijkspel";
}
