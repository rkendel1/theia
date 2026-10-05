export interface ProjectReality {
    root: string;
    name: string;
    runtime: string;
    packageManager: string;
    tools: string[];
    commands: string[];
    environment: { [key: string]: string | undefined };
}

export interface ToolReality {
    name: string;
    version?: string;
    source: 'local' | 'package-manager' | 'system';
}

export interface CommandSpec {
    name: string;
    command: string;
    args: string[];
    description?: string;
}

export interface RunOptions {
    cwd?: string;
    env?: { [key: string]: string | undefined };
    timeout?: number;
}

export interface RunResult {
    command: string;
    args: string[];
    exitCode: number;
    stdout: string;
    stderr: string;
    startedAt: string;
    finishedAt: string;
}
