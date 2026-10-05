export interface Project {
    id: string;
    name: string;
    root: string;
    createdAt: string;
    updatedAt: string;
}

export interface Workspace {
    id: string;
    projectId: string;
    name: string;
    root: string;
    createdAt: string;
    updatedAt: string;
}

export interface StudioSession {
    id: string;
    workspaceId: string;
    computeSessionId?: string;
    status: 'active' | 'idle' | 'closed';
    createdAt: string;
    updatedAt: string;
}

export interface StudioEvent {
    id: string;
    sessionId: string;
    type: string;
    timestamp: string;
    payload: unknown;
}

export interface FeltDbState {
    projects: Project[];
    workspaces: Workspace[];
    sessions: StudioSession[];
    events: StudioEvent[];
}

export interface FeltDbStoreConfig {
    root?: string;
    namespace?: string;
}

export const DEFAULT_FELTDB_CONFIG: FeltDbStoreConfig = {
    namespace: 'theia-studio'
};
