import { ContainerModule } from 'inversify';
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core/lib/common';
import { PaxService, paxPath } from '../common/pax-protocol';
import { DefaultPaxService } from './pax-service';
import { DefaultPaxClient } from './pax-client';

export default new ContainerModule(bind => {
    bind(DefaultPaxClient).toSelf().inSingletonScope();
    bind(DefaultPaxService).toSelf().inSingletonScope();
    bind(PaxService).toService(DefaultPaxService);

    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(paxPath, () => ctx.container.get(PaxService))
    ).inSingletonScope();
});
