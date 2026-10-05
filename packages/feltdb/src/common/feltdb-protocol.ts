export const feltdbPath = '/services/feltdb';

export const FeltDbService = Symbol('FeltDbService');

export interface FeltDbService {
    createProject(project: Project): Promise<Project>;
    listProjects(): Promise<Project[]>;
    getProject(projectId: string): Promise<Project | undefined>;

    createWorkspace(workspace: Workspace): Promise<Workspace>;
    listWorkspaces(projectId?: string): Promise<Workspace[]>;

    createSession(session: StudioSession): Promise<StudioSession>;
    listSessions(workspaceId?: string): Promise<StudioSession[]>;

    recordEvent(event: StudioEvent): Promise<StudioEvent>;
    listEvents(sessionId?: string): Promise<StudioEvent[]>;
}
