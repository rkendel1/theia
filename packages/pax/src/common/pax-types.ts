export const paxPath = '/services/pax';

export const PaxService = Symbol('PaxService');

export interface PaxService {
    inspectProject(root: string): Promise<ProjectReality>;
    discoverTools(root: string): Promise<ToolReality[]>;
    discoverCommands(root: string): Promise<CommandSpec[]>;
    run(command: string, args: string[], options?: RunOptions): Promise<RunResult>;
}
