import { ExamTerm } from "../domain/examTerm";

export interface Repo {
  create(t: Omit<ExamTerm, "id">): Promise<ExamTerm>;
  get(id: number): Promise<ExamTerm | null>;
  list(filter: {
    predmetId?: string;
    od?: Date;
    do?: Date;
    limit?: number;
    offset?: number;
  }): Promise<ExamTerm[]>;
}

export class InvalidArgumentError extends Error {}
export class NotFoundError extends Error {}

function parseRFC3339(s: string): Date {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new InvalidArgumentError("invalid datetime");
  return d;
}

export class IzpitiServiceUC {
  constructor(private repo: Repo) {}

  async createExamTerm(input: {
    predmetId: string;
    datumCas: string;
    lokacija: string;
    prijaveOd: string;
    prijaveDo: string;
    kapaciteta: number;
  }): Promise<ExamTerm> {
    if (!input.predmetId || !input.lokacija || input.kapaciteta <= 0) {
      throw new InvalidArgumentError("invalid input");
    }

    const datumCas = parseRFC3339(input.datumCas);
    const prijaveOd = parseRFC3339(input.prijaveOd);
    const prijaveDo = parseRFC3339(input.prijaveDo);

    if (prijaveOd > prijaveDo || prijaveDo > datumCas) {
      throw new InvalidArgumentError("invalid window");
    }

    return this.repo.create({
      predmetId: input.predmetId,
      datumCas,
      lokacija: input.lokacija,
      prijaveOd,
      prijaveDo,
      kapaciteta: input.kapaciteta
    });
  }

  async getExamTerm(id: number): Promise<ExamTerm> {
    if (id <= 0) throw new InvalidArgumentError("invalid id");
    const t = await this.repo.get(id);
    if (!t) throw new NotFoundError("not found");
    return t;
  }

  async listExamTerms(filter: {
    predmetId?: string;
    od?: string;
    do?: string;
    limit?: number;
    offset?: number;
  }): Promise<ExamTerm[]> {
    const od = filter.od ? parseRFC3339(filter.od) : undefined;
    const doD = filter.do ? parseRFC3339(filter.do) : undefined;
    return this.repo.list({
      predmetId: filter.predmetId || undefined,
      od,
      do: doD,
      limit: filter.limit ?? 50,
      offset: filter.offset ?? 0
    });
  }
}