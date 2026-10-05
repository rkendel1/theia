import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { CommandSpec, ProjectReality, RunOptions, RunResult, ToolReality } from '../common/pax-types';

export class DefaultPaxClient {
    protected readonly paxRoot: string | undefined;

    constructor() {
        this.paxRoot = undefined;
    }

    async inspectProject(root: string): Promise<ProjectReality> {
        const packageFile = path.join(root, 'package.json');
        const hasPackage = fs.existsSync(packageFile);
        const runtime = hasPackage ? 'node' : 'unknown';
        const packageManager = hasPackage ? 'npm' : 'none';
        const commands = ['test', 'build', 'dev', 'lint'];
        const tools = ['node', 'npm', 'git'];

        return {
            root,
            name: path.basename(root) || 'project',
            runtime,
            packageManager,
            tools,
            commands,
            environment: {
                PATH: process.env.PATH,
                NODE_ENV: process.env.NODE_ENV
            }
        };
    }

    async discoverTools(root: string): Promise<ToolReality[]> {
        return [
            { name: 'Node', version: process.versions.node, source: 'system' },
            { name: 'npm', version: 'latest', source: 'package-manager' },
            { name: 'git', source: 'system' }
        ].map(tool => ({ ...tool, source: tool.source as 'local' | 'package-manager' | 'system' }));
    }

    async discoverCommands(root: string): Promise<CommandSpec[]> {
        return [
            { name: 'test', command: 'npm', args: ['test'], description: 'Run the project test suite' },
            { name: 'build', command: 'npm', args: ['run', 'build'], description: 'Build the project' },
            { name: 'dev', command: 'npm', args: ['run', 'dev'], description: 'Start development mode' }
        ];
    }

    async run(command: string, args: string[], options: RunOptions = {}): Promise<RunResult> {
        const startedAt = new Date().toISOString();
        return new Promise<RunResult>((resolve, reject) => {
            const child = spawn(command, args, {
                cwd: options.cwd || process.cwd(),
                env: { ...process.env, ...options.env },
                shell: false,
                stdio: ['ignore', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', chunk => stdout += chunk.toString());
            child.stderr.on('data', chunk => stderr += chunk.toString());
            child.on('error', rejected => reject(rejected));
            child.on('close', exitCode => resolve({
                command,
                args,
                exitCode: exitCode === null ? 1 : exitCode,
                stdout,
                stderr,
                startedAt,
                finishedAt: new Date().toISOString()
            }));
        });
    }
}
