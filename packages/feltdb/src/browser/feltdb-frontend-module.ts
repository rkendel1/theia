import { injectable } from 'inversify';
import { DEFAULT_FELTDB_CONFIG, FeltDbState, FeltDbStoreConfig, Project, StudioEvent, StudioSession, Workspace } from '../common/feltdb-types';

@injectable()
export class DefaultFeltDbStore {
    protected readonly state: FeltDbState = {
        projects: [],
        workspaces: [],
        sessions: [],
        events: []
    };

    protected readonly config: FeltDbStoreConfig;

    constructor(config: FeltDbStoreConfig = DEFAULT_FELTDB_CONFIG) {
        this.config = config;
    }

    async createProject(project: Project): Promise<Project> {
        const normalized = { ...project, createdAt: project.createdAt || new Date().toISOString(), updatedAt: project.updatedAt || project.createdAt || new Date().toISOString() };
        this.state.projects = this.state.projects.filter(candidate => candidate.id !== normalized.id);
        this.state.projects.push(normalized);
        return normalized;
    }

    async getProject(projectId: string): Promise<Project | undefined> {
        return this.state.projects.find(project => project.id === projectId);
    }

    async listProjects(): Promise<Project[]> {
        return [...this.state.projects];
    }

    async createWorkspace(workspace: Workspace): Promise<Workspace> {
        const normalized = { ...workspace, createdAt: workspace.createdAt || new Date().toISOString(), updatedAt: workspace.updatedAt || workspace.createdAt || new Date().toISOString() };
        this.state.workspaces = this.state.workspaces.filter(candidate => candidate.id !== normalized.id);
        this.state.workspaces.push(normalized);
        return normalized;
    }

    async listWorkspaces(projectId?: string): Promise<Workspace[]> {
        if (!projectId) {
            return [...this.state.workspaces];
        }
        return this.state.workspaces.filter(workspace => workspace.projectId === projectId);
    }

    async createSession(session: StudioSession): Promise<StudioSession> {
        const normalized = { ...session, createdAt: session.createdAt || new Date().toISOString(), updatedAt: session.updatedAt || session.createdAt || new Date().toISOString() };
        this.state.sessions = this.state.sessions.filter(candidate => candidate.id !== normalized.id);
        this.state.sessions.push(normalized);
        return normalized;
    }

    async listSessions(workspaceId?: string): Promise<StudioSession[]> {
        if (!workspaceId) {
            return [...this.state.sessions];
        }
        return this.state.sessions.filter(session => session.workspaceId === workspaceId);
    }

    async recordEvent(event: StudioEvent): Promise<StudioEvent> {
        const normalized = { ...event, timestamp: event.timestamp || new Date().toISOString() };
        this.state.events = this.state.events.filter(candidate => candidate.id !== normalized.id);
        this.state.events.push(normalized);
        return normalized;
    }

    async listEvents(sessionId?: string): Promise<StudioEvent[]> {
        if (!sessionId) {
            return [...this.state.events];
        }
        return this.state.events.filter(event => event.sessionId === sessionId);
    }
}
