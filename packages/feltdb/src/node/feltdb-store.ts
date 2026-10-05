import { injectable } from 'inversify';
import { FeltDbService } from '../common/feltdb-protocol';
import { Project, StudioEvent, StudioSession, Workspace } from '../common/feltdb-types';
import { DefaultFeltDbStore } from './feltdb-store';

@injectable()
export class DefaultFeltDbService implements FeltDbService {
    constructor(protected readonly store: DefaultFeltDbStore) { }

    createProject(project: Project): Promise<Project> {
        return this.store.createProject(project);
    }

    listProjects(): Promise<Project[]> {
        return this.store.listProjects();
    }

    getProject(projectId: string): Promise<Project | undefined> {
        return this.store.getProject(projectId);
    }

    createWorkspace(workspace: Workspace): Promise<Workspace> {
        return this.store.createWorkspace(workspace);
    }

    listWorkspaces(projectId?: string): Promise<Workspace[]> {
        return this.store.listWorkspaces(projectId);
    }

    createSession(session: StudioSession): Promise<StudioSession> {
        return this.store.createSession(session);
    }

    listSessions(workspaceId?: string): Promise<StudioSession[]> {
        return this.store.listSessions(workspaceId);
    }

    recordEvent(event: StudioEvent): Promise<StudioEvent> {
        return this.store.recordEvent(event);
    }

    listEvents(sessionId?: string): Promise<StudioEvent[]> {
        return this.store.listEvents(sessionId);
    }
}
