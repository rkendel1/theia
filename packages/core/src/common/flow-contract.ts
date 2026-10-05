/********************************************************************************
 * Copyright (C) 2026 Contributors to Theia.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

export interface FlowProjectDescriptor {
    id: string;
    name: string;
}

export interface FlowServiceRequirement {
    name: string;
    type?: 'service' | 'capability' | 'tool';
    required?: boolean;
    description?: string;
}

export interface FlowContractSnapshot {
    version: string;
    project: FlowProjectDescriptor;
    root: string;
    services: FlowServiceRequirement[];
    capabilities: FlowServiceRequirement[];
    requirements: FlowServiceRequirement[];
}

export interface ProjectRealitySnapshot {
    projectId?: string;
    services: string[];
    capabilities: string[];
    evidence: Array<{
        name: string;
        value: string | boolean | number | undefined;
        source: 'PAX' | 'system' | 'workspace';
    }>;
}

export type FlowDriftType =
    | 'COMPUTE_UNAVAILABLE'
    | 'REQUIREMENT_MISSING'
    | 'CONTRACT_DRIFT';

export interface FlowDrift {
    type: FlowDriftType;
    requirement: string;
    message: string;
}

export interface FlowEvaluationResult {
    ok: boolean;
    drifts: FlowDrift[];
}

export namespace FlowContractParser {
    export function parse(raw: string, projectRoot: string = process.cwd()): FlowContractSnapshot {
        const trimmed = raw.trim();
        if (!trimmed) {
            return createDefaultSnapshot(projectRoot);
        }

        let parsed: Partial<FlowContractSnapshot>;
        try {
            parsed = JSON.parse(trimmed) as Partial<FlowContractSnapshot>;
        } catch (error) {
            parsed = parseSimpleFlow(trimmed);
        }

        const services = Array.isArray(parsed.services) ? parsed.services : [];
        const capabilities = Array.isArray(parsed.capabilities) ? parsed.capabilities : [];
        const requirements = Array.isArray(parsed.requirements) ? parsed.requirements : [];

        return {
            version: parsed.version || '1.0.0',
            project: {
                id: parsed.project && parsed.project.id ? parsed.project.id : 'unknown-project',
                name: parsed.project && parsed.project.name ? parsed.project.name : 'unknown-project'
            },
            root: parsed.root || projectRoot,
            services,
            capabilities,
            requirements
        };
    }

    export function parseSimpleFlow(raw: string): Partial<FlowContractSnapshot> {
        const contract: Partial<FlowContractSnapshot> = {
            version: '1.0.0',
            project: { id: 'unknown-project', name: 'unknown-project' },
            root: process.cwd(),
            services: [],
            capabilities: [],
            requirements: []
        };

        const lines = raw.split(/\r?\n/);
        for (const line of lines) {
            const text = line.trim();
            if (!text || text.startsWith('#')) {
                continue;
            }

            const [key, ...rest] = text.split(':');
            const value = rest.join(':').trim();
            if (!key) {
                continue;
            }

            if (key === 'version') {
                contract.version = value || contract.version;
            } else if (key === 'project' || key === 'name') {
                if (contract.project) {
                    contract.project.name = value || contract.project.name;
                }
            } else if (key === 'id') {
                if (!contract.project) {
                    contract.project = { id: '', name: 'unknown-project' };
                }
                contract.project.id = value || contract.project.id || 'unknown-project';
            } else if (key === 'root') {
                contract.root = value || contract.root || process.cwd();
            } else if (key === 'service' || key === 'services') {
                contract.services = parseSimpleRequirementList(value);
            } else if (key === 'capability' || key === 'capabilities') {
                contract.capabilities = parseSimpleRequirementList(value);
            } else if (key === 'requirement' || key === 'requirements') {
                contract.requirements = parseSimpleRequirementList(value);
            }
        }

        return contract;
    }
}

export function createDefaultSnapshot(projectRoot: string): FlowContractSnapshot {
    return {
        version: '1.0.0',
        project: { id: 'unknown-project', name: 'unknown-project' },
        root: projectRoot,
        services: [],
        capabilities: [],
        requirements: []
    };
}

export function isRequirementSatisfied(requirement: FlowServiceRequirement, reality: ProjectRealitySnapshot): boolean {
    const requirementKey = (requirement.name || '').toLowerCase();
    const presentServices = new Set((reality.services || []).map(item => item.toLowerCase()));
    const presentCapabilities = new Set((reality.capabilities || []).map(item => item.toLowerCase()));

    if (requirement.type === 'capability') {
        return presentCapabilities.has(requirementKey);
    }

    if (requirement.type === 'tool') {
        return presentServices.has(requirementKey) || presentCapabilities.has(requirementKey);
    }

    return presentServices.has(requirementKey) || presentCapabilities.has(requirementKey);
}

export function evaluateFlowContract(snapshot: FlowContractSnapshot, reality: ProjectRealitySnapshot): FlowEvaluationResult {
    const drifts: FlowDrift[] = [];
    const allRequirements = (snapshot.requirements || []).concat(snapshot.services || []).concat(snapshot.capabilities || []);
    const requirementNames = new Set<string>();

    for (const requirement of allRequirements) {
        const requirementName = requirement.name || '';
        if (!requirementName) {
            continue;
        }
        requirementNames.add(requirementName.toLowerCase());

        const required = requirement.required !== false;
        if (!required) {
            continue;
        }

        if (!isRequirementSatisfied(requirement, reality)) {
            const type = requirementName.toLowerCase() === 'compute' ? 'COMPUTE_UNAVAILABLE' : 'REQUIREMENT_MISSING';
            drifts.push({
                type,
                requirement: requirementName,
                message: requirementName === 'Compute'
                    ? 'Compute is required by the contract but is unavailable in project reality.'
                    : `Required requirement '${requirementName}' is missing from project reality.`
            });
        }
    }

    if (drifts.length === 0) {
        return { ok: true, drifts: [] };
    }

    return { ok: false, drifts };
}

export function createProjectReality(projectId: string, services: string[], capabilities: string[] = []): ProjectRealitySnapshot {
    const evidence = services.map(name => ({ name, value: true, source: 'PAX' as const }))
        .concat(capabilities.map(name => ({ name, value: true, source: 'PAX' as const }))); 

    return {
        projectId,
        services,
        capabilities,
        evidence
    };
}

function parseSimpleRequirementList(value: string): FlowServiceRequirement[] {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map(item => item.trim())
        .filter(item => !!item)
        .map(item => ({
            name: item,
            type: 'service',
            required: true,
            description: item
        }));
}

export function normalizeRequirementName(value: string): string {
    return value.trim();
}

export function createContractFromFlowDocument(raw: string, projectRoot: string): FlowContractSnapshot {
    return FlowContractParser.parse(raw, projectRoot);
}

export function discoverFlowContract(projectRoot: string): FlowContractSnapshot | undefined {
    const fs = require('fs');
    const path = require('path');
    const flowFile = path.join(projectRoot, '.flow');

    if (!fs.existsSync(flowFile)) {
        return undefined;
    }

    const content = fs.readFileSync(flowFile, 'utf8');
    return createContractFromFlowDocument(content, projectRoot);
}

export function persistSnapshotToFeltDb(snapshot: FlowContractSnapshot, feltDb: { append: (entry: any) => void }): void {
    feltDb.append({
        type: 'flow-contract-snapshot',
        version: snapshot.version,
        project: snapshot.project,
        root: snapshot.root,
        services: snapshot.services,
        capabilities: snapshot.capabilities,
        requirements: snapshot.requirements
    });
}

export function createPaxRealityFromProject(projectRoot: string): ProjectRealitySnapshot {
    const fs = require('fs');
    const path = require('path');
    const projectName = path.basename(projectRoot) || 'project';
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const services: string[] = ['Node'];
    const capabilities: string[] = [];

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const dependencies = Object.keys(packageJson.dependencies || {});
        const devDependencies = Object.keys(packageJson.devDependencies || {});
        for (const dependency of dependencies.concat(devDependencies)) {
            if (dependency.toLowerCase().includes('felt') || dependency.toLowerCase().includes('pax')) {
                services.push(dependency);
            }
        }
    }

    return createProjectReality(projectName, services, capabilities);
}
