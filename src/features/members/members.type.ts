interface ICurrentMember {
  name: string;
  isActive: boolean;
  rank: string;
  currentExp: bigint;
}

interface IFreshMember {
  name: string;
  rank: string;
  currentExp: bigint;
}

interface IRuneMetricsResponse {
  error?: string;
  activities?: {
    date: string;
  }[];
}

type TMemberMap = Map<string, { rank: string; currentExp: bigint }>;

export { ICurrentMember, IFreshMember, IRuneMetricsResponse, TMemberMap };
