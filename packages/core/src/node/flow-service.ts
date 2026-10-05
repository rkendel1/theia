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

import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
    createContractFromFlowDocument,
    createProjectReality,
    discoverFlowContract,
    evaluateFlowContract,
    FlowContractSnapshot,
    ProjectRealitySnapshot
} from './flow-contract';

describe('Flow contract', () => {

    it('discovers a .flow file and creates a contract snapshot', () => {
        const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'theia-flow-'));
        const flow = JSON.stringify({
            version: '1.0.0',
            project: { id: 'my-app', name: 'my-app' },
            root: projectRoot,
            services: [
                { name: 'Node', required: true, type: 'service' },
                { name: 'FeltDB', required: true, type: 'service' },
                { name: 'PAX', required: true, type: 'service' },
                { name: 'Compute', required: true, type: 'service' }
            ],
            capabilities: [],
            requirements: [
                { name: 'Node', required: true, type: 'service' },
                { name: 'FeltDB', required: true, type: 'service' },
                { name: 'PAX', required: true, type: 'service' },
                { name: 'Compute', required: true, type: 'service' }
            ]
        }, null, 2);
        fs.writeFileSync(path.join(projectRoot, '.flow'), flow);

        const snapshot = discoverFlowContract(projectRoot)!;
        assert.ok(snapshot);
        assert.strictEqual(snapshot.project.id, 'my-app');
        assert.strictEqual(snapshot.root, projectRoot);
        assert.strictEqual(snapshot.services.length, 4);
        assert.strictEqual(snapshot.requirements.length, 4);
    });

    it('reports drift when .flow requires Compute and the project reality is missing it', () => {
        const contract: FlowContractSnapshot = {
            version: '1.0.0',
            project: { id: 'my-app', name: 'my-app' },
            root: '/workspace/my-app',
            services: [{ name: 'Compute', required: true, type: 'service' }],
            capabilities: [],
            requirements: [{ name: 'Compute', required: true, type: 'service' }]
        };
        const reality: ProjectRealitySnapshot = createProjectReality('my-app', ['Node', 'FeltDB', 'PAX']);

        const result = evaluateFlowContract(contract, reality);
        assert.strictEqual(result.ok, false);
        assert.strictEqual(result.drifts.length, 1);
        assert.strictEqual(result.drifts[0].type, 'COMPUTE_UNAVAILABLE');
        assert.ok(result.drifts[0].message.includes('Compute'));
    });

    it('accepts project reality when the contract is satisfied', () => {
        const contract: FlowContractSnapshot = {
            version: '1.0.0',
            project: { id: 'my-app', name: 'my-app' },
            root: '/workspace/my-app',
            services: [{ name: 'Compute', required: true, type: 'service' }],
            capabilities: [],
            requirements: [{ name: 'Compute', required: true, type: 'service' }]
        };
        const reality: ProjectRealitySnapshot = createProjectReality('my-app', ['Node', 'FeltDB', 'PAX', 'Compute']);

        const result = evaluateFlowContract(contract, reality);
        assert.strictEqual(result.ok, true);
        assert.strictEqual(result.drifts.length, 0);
    });

    it('parses a raw .flow document when it is not JSON', () => {
        const snapshot = createContractFromFlowDocument([
            'version: 1.0.0',
            'project: my-app',
            'id: my-app',
            'root: /workspace/my-app',
            'requirements: Node, FeltDB, PAX, Compute'
        ].join('\n'), '/workspace/my-app');

        assert.strictEqual(snapshot.version, '1.0.0');
        assert.strictEqual(snapshot.requirements.length, 4);
        assert.strictEqual(snapshot.requirements[3].name, 'Compute');
    });
});
