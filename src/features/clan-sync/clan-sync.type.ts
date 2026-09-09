interface IActiveMember {
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

type TMemberMap = Map<string, { rank: string; currentExp: bigint }>;

export { IActiveMember, IFreshMember, TMemberMap };
