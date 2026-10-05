import { bind } from 'inversify';
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core/lib/common';
import { FeltDbService, feltDbPath } from '../common/feltdb-protocol';
import { DefaultFeltDbService } from './feltdb-service';
import { DefaultFeltDbStore } from './feltdb-store';

export default (bind: any) => {
    bind(DefaultFeltDbStore).toSelf().inSingletonScope();
    bind(DefaultFeltDbService).toSelf().inSingletonScope();
    bind(FeltDbService).toService(DefaultFeltDbService);

    bind(ConnectionHandler).toDynamicValue(ctx =>
        new JsonRpcConnectionHandler(feltDbPath, () => ctx.container.get(FeltDbService))
    ).inSingletonScope();
};
