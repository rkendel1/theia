import { injectable } from 'inversify';
import { PaxService } from '../common/pax-protocol';
import { CommandSpec, ProjectReality, RunOptions, RunResult, ToolReality } from '../common/pax-types';
import { DefaultPaxClient } from './pax-client';

@injectable()
export class DefaultPaxService implements PaxService {
    constructor(protected readonly client: DefaultPaxClient) { }

    inspectProject(root: string): Promise<ProjectReality> {
        return this.client.inspectProject(root);
    }

    discoverTools(root: string): Promise<ToolReality[]> {
        return this.client.discoverTools(root);
    }

    discoverCommands(root: string): Promise<CommandSpec[]> {
        return this.client.discoverCommands(root);
    }

    run(command: string, args: string[], options?: RunOptions): Promise<RunResult> {
        return this.client.run(command, args, options);
    }
}
