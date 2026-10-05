import { ContainerModule } from 'inversify';
import { WebSocketConnectionProvider } from '@theia/core/lib/browser';
import { FeltDbService, feltDbPath } from '../common/feltdb-protocol';
import { DefaultFeltDbServiceProxy } from './feltdb-service';

export default new ContainerModule(bind => {
    bind(DefaultFeltDbServiceProxy).toSelf().inSingletonScope();
    bind(FeltDbService).toDynamicValue(ctx => {
        const provider = ctx.container.get(WebSocketConnectionProvider);
        return provider.createProxy<FeltDbService>(feltDbPath);
    }).inSingletonScope();
});
