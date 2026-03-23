import { Repo } from "../app/usecases";
import { ExamTerm } from "../domain/examTerm";

export class MemoryRepo implements Repo {
  private nextId = 1;
  private items = new Map<number, ExamTerm>();

  async create(t: Omit<ExamTerm, "id">): Promise<ExamTerm> {
    const created: ExamTerm = { id: this.nextId++, ...t };
    this.items.set(created.id, created);
    return created;
  }

  async get(id: number): Promise<ExamTerm | null> {
    return this.items.get(id) ?? null;
  }

  async list(): Promise<ExamTerm[]> {
    return [...this.items.values()];
  }
}