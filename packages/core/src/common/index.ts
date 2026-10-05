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

import {
    createPaxRealityFromProject,
    discoverFlowContract,
    evaluateFlowContract,
    FlowContractSnapshot,
    FlowEvaluationResult,
    persistSnapshotToFeltDb,
    ProjectRealitySnapshot
} from '../common/flow-contract';

export class FlowProjectService {
    constructor(protected readonly projectRoot: string) { }

    discover(): FlowContractSnapshot | undefined {
        return discoverFlowContract(this.projectRoot);
    }

    createReality(): ProjectRealitySnapshot {
        return createPaxRealityFromProject(this.projectRoot);
    }

    evaluate(): FlowEvaluationResult {
        const contract = this.discover();
        if (!contract) {
            return { ok: false, drifts: [{
                type: 'CONTRACT_DRIFT',
                requirement: '.flow',
                message: 'No authoritative .flow file was found for this project.'
            }] };
        }

        const reality = this.createReality();
        return evaluateFlowContract(contract, reality);
    }

    persist(snapshot: FlowContractSnapshot): void {
        persistSnapshotToFeltDb(snapshot, {
            append: (_entry: any) => undefined
        });
    }
}
